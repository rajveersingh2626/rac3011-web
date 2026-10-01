#!/usr/bin/env python3
"""
DRR Tenure Gallery Image Processing & Optimization Utility
==========================================================
Iterates through .zip archives and image files of past DRR tenure collages,
crops phone status bar / Rotary logo banners from the top and phone gallery
controls from the bottom, optimizes them into modern WebP format, and generates
a manifest mapping each DRR tenure to its collage assets.

Usage:
  python scripts/process_drr_collages.py \
    --input-dir "c:\\Users\\jasra\\OneDrive\\Desktop\\DAC website personal" \
    --output-dir "c:\\Users\\jasra\\OneDrive\\Desktop\\rac3011-web\\public\\assets\\drr-collages" \
    --crop-top 215 \
    --crop-bottom 240 \
    --quality 85
"""

import os
import sys
import io
import json
import zipfile
import argparse
from typing import Dict, List, Tuple
from PIL import Image

# Known DRR Mapping
TENURE_MAP = {
    '2015-16': {'drrIds': ['drr-32'], 'name': 'Harsh Sirohi'},
    '2016-17': {'drrIds': ['drr-33'], 'name': 'Manuj Mittal'},
    '2017-18': {'drrIds': ['drr-34'], 'name': 'Anmol Chawla'},
    '2018-19': {'drrIds': ['drr-35'], 'name': 'Ashima Agarwal Gupta'},
    '2019-20': {'drrIds': ['drr-36'], 'name': 'Arpit Mehra'},
    '2020-21 Sarthak': {'drrIds': ['drr-38'], 'name': 'Sarthak Bansal', 'slug': '2020-21-sarthak'},
    '2020-21': {'drrIds': ['drr-37'], 'name': 'Yaamini Thareja', 'slug': '2020-21-yaamini'},
    '2021-22': {'drrIds': ['drr-39'], 'name': 'Niranjan Dev Singh'},
    '2022-23': {'drrIds': ['drr-40', 'drr-41'], 'name': 'Rahul Sanjeev Sharma & Ankit Arvind Singh'},
    '2023-24': {'drrIds': ['drr-42'], 'name': 'Kriti Malhotra'},
    '2024-25': {'drrIds': ['drr-43'], 'name': 'Geetika'},
    '2025-26': {'drrIds': ['drr-44'], 'name': 'Rishika Khanna'},
}

def resolve_target_info(filename: str) -> Tuple[str, List[str], str]:
    """Resolves tenure, drrIds, and base prefix from a filename."""
    base = os.path.splitext(os.path.basename(filename))[0].strip()
    
    if '2020-21' in base and 'sarthak' in base.lower():
        return '2020-21', ['drr-38'], 'drr-38_2020-21-sarthak'
    if base == '2020-21':
        return '2020-21', ['drr-37'], 'drr-37_2020-21-yaamini'
    
    for key, info in TENURE_MAP.items():
        if key.lower() in base.lower():
            prefix = f"{info['drrIds'][0]}_{key.replace(' ', '_')}"
            return key, info['drrIds'], prefix
            
    # Generic fallback
    clean_base = base.replace(' ', '_')
    return clean_base, [f"drr-{clean_base}"], clean_base

def process_single_image(
    image_data: bytes,
    crop_top: int,
    crop_bottom: int,
    quality: int,
    max_width: int,
) -> io.BytesIO:
    """Crops and optimizes a single image buffer into WebP."""
    im = Image.open(io.BytesIO(image_data))
    
    # Convert RGBA/P to RGB if needed for clean compression
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        alpha = im.convert('RGBA').split()[-1]
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=alpha)
        im = bg
    elif im.mode != 'RGB':
        im = im.convert('RGB')
        
    width, height = im.size
    aspect = height / float(width) if width > 0 else 1.0
    
    # Check if this is a phone screenshot (tall aspect ratio > 1.9)
    if aspect > 1.9:
        top = min(crop_top, height // 3)
        bottom = max(top + 100, height - crop_bottom)
        cropped = im.crop((0, top, width, bottom))
    elif aspect > 1.2:
        # Mild screenshot or cropped photo: small top trim (e.g. 5% if status exists)
        # For 1074x1469, trim subtle outer screenshot frame if needed
        cropped = im
    else:
        cropped = im
        
    # Resize if max_width is exceeded
    if max_width and cropped.size[0] > max_width:
        new_w = max_width
        new_h = int(cropped.size[1] * (max_width / float(cropped.size[0])))
        cropped = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
    out = io.BytesIO()
    cropped.save(out, format='WEBP', quality=quality, method=6)
    out.seek(0)
    return out

def main():
    parser = argparse.ArgumentParser(description='DRR Tenure Image Processing Utility')
    parser.add_argument('--input-dir', default=r'c:\Users\jasra\OneDrive\Desktop\DAC website personal',
                        help='Input directory containing .zip files or loose images')
    parser.add_argument('--output-dir', default=r'c:\Users\jasra\OneDrive\Desktop\rac3011-web\public\assets\drr-collages',
                        help='Output directory for optimized WebP collages')
    parser.add_argument('--crop-top', type=int, default=215,
                        help='Pixels to crop from top of phone screenshots (removes logo/status bar)')
    parser.add_argument('--crop-bottom', type=int, default=240,
                        help='Pixels to crop from bottom of phone screenshots (removes nav controls)')
    parser.add_argument('--quality', type=int, default=85,
                        help='WebP output quality (1-100)')
    parser.add_argument('--max-width', type=int, default=1200,
                        help='Maximum width in pixels for web output')
    
    args = parser.parse_args()
    
    os.makedirs(args.output_dir, exist_ok=True)
    
    manifest: Dict[str, List[str]] = {}
    total_processed = 0
    
    print(f"=== DRR Collage Processing Utility ===")
    print(f"Input:       {args.input_dir}")
    print(f"Output:      {args.output_dir}")
    print(f"Crop Top:    {args.crop_top}px")
    print(f"Crop Bottom: {args.crop_bottom}px")
    print(f"Quality:     {args.quality}%")
    print("---------------------------------------")
    
    entries = sorted(os.listdir(args.input_dir))
    
    for entry in entries:
        full_path = os.path.join(args.input_dir, entry)
        
        # Skip font files or unrelated zips
        if 'font' in entry.lower():
            continue
            
        if entry.endswith('.zip'):
            tenure, drr_ids, prefix = resolve_target_info(entry)
            print(f"Processing archive: {entry} -> Tenure: {tenure}, DRR IDs: {drr_ids}")
            
            try:
                with zipfile.ZipFile(full_path, 'r') as z:
                    names = sorted([
                        n for n in z.namelist() 
                        if not n.startswith('__MACOSX') 
                        and not n.endswith('/')
                        and n.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
                    ])
                    
                    archive_outputs = []
                    for idx, name in enumerate(names):
                        img_bytes = z.read(name)
                        optimized = process_single_image(
                            img_bytes,
                            crop_top=args.crop_top,
                            crop_bottom=args.crop_bottom,
                            quality=args.quality,
                            max_width=args.max_width
                        )
                        
                        out_filename = f"{prefix}_{idx + 1:02d}.webp"
                        out_path = os.path.join(args.output_dir, out_filename)
                        with open(out_path, 'wb') as f_out:
                            f_out.write(optimized.read())
                            
                        web_rel_path = f"/assets/drr-collages/{out_filename}"
                        archive_outputs.append(web_rel_path)
                        total_processed += 1
                        
                    # Map to all associated DRR IDs
                    for drr_id in drr_ids:
                        manifest.setdefault(drr_id, []).extend(archive_outputs)
            except Exception as e:
                print(f"Error processing {entry}: {e}", file=sys.stderr)
                
        elif os.path.isfile(full_path) and entry.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            tenure, drr_ids, prefix = resolve_target_info(entry)
            print(f"Processing loose image: {entry} -> Tenure: {tenure}, DRR IDs: {drr_ids}")
            
            try:
                with open(full_path, 'rb') as f_in:
                    img_bytes = f_in.read()
                optimized = process_single_image(
                    img_bytes,
                    crop_top=args.crop_top,
                    crop_bottom=args.crop_bottom,
                    quality=args.quality,
                    max_width=args.max_width
                )
                
                out_filename = f"{prefix}_01.webp"
                out_path = os.path.join(args.output_dir, out_filename)
                with open(out_path, 'wb') as f_out:
                    f_out.write(optimized.read())
                    
                web_rel_path = f"/assets/drr-collages/{out_filename}"
                for drr_id in drr_ids:
                    manifest.setdefault(drr_id, []).append(web_rel_path)
                total_processed += 1
            except Exception as e:
                print(f"Error processing {entry}: {e}", file=sys.stderr)

    # Save manifest.json
    manifest_path = os.path.join(args.output_dir, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
        
    print("---------------------------------------")
    print(f"Done! Processed {total_processed} images into WebP.")
    print(f"Manifest written to: {manifest_path}")

if __name__ == '__main__':
    main()
