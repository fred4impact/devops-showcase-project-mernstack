import os
import asyncio
from celery import Celery
from celery.utils.log import get_task_logger
import requests
from PIL import Image
import io
from typing import Optional

logger = get_task_logger(__name__)

# Create Celery app instance
from .celery import app

@app.task(bind=True, name='process_image')
def process_image(self, image_url: str, image_type: str = 'event', user_id: Optional[str] = None):
    """
    Process uploaded images - resize, optimize, and create thumbnails
    """
    try:
        logger.info(f"Processing image: {image_url} for type: {image_type}")
        
        # Download the image
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        # Open image with PIL
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Define sizes based on image type
        if image_type == 'event':
            sizes = [
                (1920, 1080, 'large'),    # Full size for event banners
                (800, 450, 'medium'),     # Medium size for cards
                (400, 225, 'small'),      # Small size for thumbnails
            ]
        elif image_type == 'profile':
            sizes = [
                (300, 300, 'large'),      # Profile picture
                (150, 150, 'medium'),     # Medium profile
                (75, 75, 'small'),        # Small avatar
            ]
        else:
            sizes = [
                (800, 600, 'large'),      # Default large
                (400, 300, 'medium'),     # Default medium
                (200, 150, 'small'),      # Default small
            ]
        
        processed_images = {}
        
        for width, height, size_name in sizes:
            # Resize image maintaining aspect ratio
            resized_image = image.copy()
            resized_image.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Create a new image with exact dimensions and paste the resized image
            new_image = Image.new('RGB', (width, height), (255, 255, 255))
            x = (width - resized_image.width) // 2
            y = (height - resized_image.height) // 2
            new_image.paste(resized_image, (x, y))
            
            # Save to bytes
            img_bytes = io.BytesIO()
            new_image.save(img_bytes, format='JPEG', quality=85, optimize=True)
            img_bytes.seek(0)
            
            processed_images[size_name] = {
                'data': img_bytes.getvalue(),
                'width': width,
                'height': height,
                'size': len(img_bytes.getvalue())
            }
        
        logger.info(f"Successfully processed image: {image_url}")
        return {
            'status': 'success',
            'original_url': image_url,
            'processed_images': processed_images
        }
        
    except Exception as exc:
        logger.error(f"Error processing image {image_url}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

@app.task(bind=True, name='cleanup_old_images')
def cleanup_old_images(self, days_old: int = 30):
    """
    Clean up old unused images from storage
    """
    try:
        logger.info(f"Starting cleanup of images older than {days_old} days")
        
        # This would typically involve:
        # 1. Querying the database for old images
        # 2. Checking if they're still referenced
        # 3. Deleting unused images from storage
        # 4. Updating database records
        
        logger.info("Image cleanup completed")
        return {'status': 'success', 'cleaned_count': 0}
        
    except Exception as exc:
        logger.error(f"Error during image cleanup: {str(exc)}")
        raise self.retry(exc=exc, countdown=300, max_retries=2)

@app.task(bind=True, name='generate_image_variants')
def generate_image_variants(self, image_url: str, variants: list):
    """
    Generate specific image variants (thumbnails, different sizes, etc.)
    """
    try:
        logger.info(f"Generating variants for image: {image_url}")
        
        # Download the image
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        # Open image with PIL
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        generated_variants = {}
        
        for variant in variants:
            width = variant.get('width', 800)
            height = variant.get('height', 600)
            quality = variant.get('quality', 85)
            name = variant.get('name', f"{width}x{height}")
            
            # Resize image
            resized_image = image.copy()
            resized_image.thumbnail((width, height), Image.Resampling.LANCZOS)
            
            # Create new image with exact dimensions
            new_image = Image.new('RGB', (width, height), (255, 255, 255))
            x = (width - resized_image.width) // 2
            y = (height - resized_image.height) // 2
            new_image.paste(resized_image, (x, y))
            
            # Save to bytes
            img_bytes = io.BytesIO()
            new_image.save(img_bytes, format='JPEG', quality=quality, optimize=True)
            img_bytes.seek(0)
            
            generated_variants[name] = {
                'data': img_bytes.getvalue(),
                'width': width,
                'height': height,
                'size': len(img_bytes.getvalue())
            }
        
        logger.info(f"Successfully generated variants for image: {image_url}")
        return {
            'status': 'success',
            'original_url': image_url,
            'variants': generated_variants
        }
        
    except Exception as exc:
        logger.error(f"Error generating variants for {image_url}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

@app.task(bind=True, name='optimize_image')
def optimize_image(self, image_url: str, max_size: int = 1024*1024):  # 1MB default
    """
    Optimize image file size while maintaining quality
    """
    try:
        logger.info(f"Optimizing image: {image_url}")
        
        # Download the image
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        original_size = len(response.content)
        logger.info(f"Original image size: {original_size} bytes")
        
        if original_size <= max_size:
            logger.info("Image already within size limit")
            return {
                'status': 'success',
                'original_url': image_url,
                'optimized': False,
                'original_size': original_size,
                'optimized_size': original_size
            }
        
        # Open image with PIL
        image = Image.open(io.BytesIO(response.content))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Try different quality levels
        for quality in range(95, 50, -5):
            img_bytes = io.BytesIO()
            image.save(img_bytes, format='JPEG', quality=quality, optimize=True)
            optimized_size = len(img_bytes.getvalue())
            
            if optimized_size <= max_size:
                logger.info(f"Optimized image to {optimized_size} bytes with quality {quality}")
                return {
                    'status': 'success',
                    'original_url': image_url,
                    'optimized': True,
                    'original_size': original_size,
                    'optimized_size': optimized_size,
                    'quality': quality,
                    'data': img_bytes.getvalue()
                }
        
        # If still too large, resize the image
        logger.info("Resizing image to fit size limit")
        ratio = (max_size / original_size) ** 0.5
        new_width = int(image.width * ratio)
        new_height = int(image.height * ratio)
        
        resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        img_bytes = io.BytesIO()
        resized_image.save(img_bytes, format='JPEG', quality=85, optimize=True)
        optimized_size = len(img_bytes.getvalue())
        
        logger.info(f"Resized and optimized image to {optimized_size} bytes")
        return {
            'status': 'success',
            'original_url': image_url,
            'optimized': True,
            'original_size': original_size,
            'optimized_size': optimized_size,
            'resized': True,
            'new_dimensions': (new_width, new_height),
            'data': img_bytes.getvalue()
        }
        
    except Exception as exc:
        logger.error(f"Error optimizing image {image_url}: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)
