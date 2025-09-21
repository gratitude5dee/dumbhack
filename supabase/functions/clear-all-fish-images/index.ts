import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting cleanup of all fish images and thumbnails...')

    let deletedImages = 0
    let deletedThumbnails = 0

    // Get all files from fish-images bucket
    const { data: fishImages, error: fishImagesError } = await supabaseClient.storage
      .from('fish-images')
      .list()

    if (fishImagesError) {
      console.error('Error listing fish images:', fishImagesError)
      throw fishImagesError
    }

    // Delete all files from fish-images bucket
    if (fishImages && fishImages.length > 0) {
      const imageNames = fishImages.map(file => file.name)
      console.log(`Found ${imageNames.length} fish images to delete`)

      const { error: deleteImagesError } = await supabaseClient.storage
        .from('fish-images')
        .remove(imageNames)

      if (deleteImagesError) {
        console.error('Error deleting fish images:', deleteImagesError)
        throw deleteImagesError
      }

      deletedImages = imageNames.length
      console.log(`✅ Deleted ${deletedImages} fish images`)
    }

    // Get all files from fish-thumbnails bucket
    const { data: thumbnails, error: thumbnailsError } = await supabaseClient.storage
      .from('fish-thumbnails')
      .list()

    if (thumbnailsError) {
      console.error('Error listing fish thumbnails:', thumbnailsError)
      throw thumbnailsError
    }

    // Delete all files from fish-thumbnails bucket
    if (thumbnails && thumbnails.length > 0) {
      const thumbnailNames = thumbnails.map(file => file.name)
      console.log(`Found ${thumbnailNames.length} fish thumbnails to delete`)

      const { error: deleteThumbnailsError } = await supabaseClient.storage
        .from('fish-thumbnails')
        .remove(thumbnailNames)

      if (deleteThumbnailsError) {
        console.error('Error deleting fish thumbnails:', deleteThumbnailsError)
        throw deleteThumbnailsError
      }

      deletedThumbnails = thumbnailNames.length
      console.log(`✅ Deleted ${deletedThumbnails} fish thumbnails`)
    }

    const totalDeleted = deletedImages + deletedThumbnails

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted all fish images and thumbnails`,
        deletedImages,
        deletedThumbnails,
        totalDeleted
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})