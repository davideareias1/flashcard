import { NextResponse } from 'next/server';

// Define response type based on Pixabay API structure
interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_BASE_URL = 'https://pixabay.com/api/';

export async function GET(request: Request) {
  if (!PIXABAY_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const perPage = searchParams.get('per_page') || '20'; // Default to 20 images

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${PIXABAY_BASE_URL}?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${perPage}&pretty=true&safesearch=true`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.statusText}`);
    }

    const data = (await response.json()) as PixabayResponse;

    if (data.hits.length === 0) {
      return NextResponse.json(
        { error: 'No images found' },
        { status: 404 }
      );
    }

    // Return the full response structure
    return NextResponse.json({
      total: data.total,
      totalHits: data.totalHits,
      hits: data.hits.map(image => ({
        id: image.id,
        pageURL: image.pageURL,
        tags: image.tags,
        previewURL: image.previewURL,
        previewWidth: image.previewWidth,
        previewHeight: image.previewHeight,
        webformatURL: image.webformatURL,
        webformatWidth: image.webformatWidth,
        webformatHeight: image.webformatHeight,
        largeImageURL: image.largeImageURL,
        imageWidth: image.imageWidth,
        imageHeight: image.imageHeight,
        views: image.views,
        downloads: image.downloads,
        collections: image.collections,
        likes: image.likes,
        comments: image.comments,
        user: image.user,
        userImageURL: image.userImageURL
      }))
    });

  } catch (error) {
    console.error('Error fetching from Pixabay:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}