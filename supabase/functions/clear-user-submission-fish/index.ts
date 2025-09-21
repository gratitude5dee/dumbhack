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

    console.log('Starting cleanup of user submission fish...')

    // Get all user_submissions to find associated fish
    const { data: submissions, error: submissionsError } = await supabaseClient
      .from('user_submissions')
      .select('client_fingerprint')

    if (submissionsError) {
      console.error('Error fetching user submissions:', submissionsError)
      throw submissionsError
    }

    if (!submissions || submissions.length === 0) {
      console.log('No user submissions found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No user submissions found to delete',
          deletedFish: 0,
          deletedSubmissions: 0,
          deletedImages: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const fingerprints = submissions.map(s => s.client_fingerprint).filter(Boolean)
    console.log(`Found ${fingerprints.length} user submissions with fingerprints`)

    // Find all fish records associated with user submissions
    const { data: fishToDelete, error: fishError } = await supabaseClient
      .from('fish')
      .select('id, image_url, thumbnail_url, client_fingerprint')
      .or(`submission_id.is.not.null,client_fingerprint.in.(${fingerprints.join(',')})`)

    if (fishError) {
      console.error('Error fetching fish to delete:', fishError)
      throw fishError
    }

    console.log(`Found ${fishToDelete?.length || 0} fish records to delete`)

    let deletedImages = 0
    let deletedFish = 0
    let deletedSubmissions = 0

    // Delete image files from storage
    if (fishToDelete && fishToDelete.length > 0) {
      const imageUrls = fishToDelete
        .map(fish => fish.image_url)
        .filter(Boolean)
        .map(url => {
          // Extract filename from the public URL
          const parts = url.split('/')
          return parts[parts.length - 1]
        })

      const thumbnailUrls = fishToDelete
        .map(fish => fish.thumbnail_url)
        .filter(Boolean)
        .map(url => {
          const parts = url.split('/')
          return parts[parts.length - 1]
        })

      // Delete main images
      if (imageUrls.length > 0) {
        const { error: deleteImagesError } = await supabaseClient.storage
          .from('fish-images')
          .remove(imageUrls)

        if (deleteImagesError) {
          console.error('Error deleting images:', deleteImagesError)
        } else {
          deletedImages += imageUrls.length
          console.log(`Deleted ${imageUrls.length} main images`)
        }
      }

      // Delete thumbnails
      if (thumbnailUrls.length > 0) {
        const { error: deleteThumbnailsError } = await supabaseClient.storage
          .from('fish-thumbnails')
          .remove(thumbnailUrls)

        if (deleteThumbnailsError) {
          console.error('Error deleting thumbnails:', deleteThumbnailsError)
        } else {
          deletedImages += thumbnailUrls.length
          console.log(`Deleted ${thumbnailUrls.length} thumbnails`)
        }
      }

      // Delete fish records
      const fishIds = fishToDelete.map(fish => fish.id)
      const { error: deleteFishError } = await supabaseClient
        .from('fish')
        .delete()
        .in('id', fishIds)

      if (deleteFishError) {
        console.error('Error deleting fish records:', deleteFishError)
        throw deleteFishError
      }

      deletedFish = fishIds.length
      console.log(`Deleted ${deletedFish} fish records`)
    }

    // Delete user submissions
    const { error: deleteSubmissionsError } = await supabaseClient
      .from('user_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteSubmissionsError) {
      console.error('Error deleting user submissions:', deleteSubmissionsError)
      throw deleteSubmissionsError
    }

    deletedSubmissions = submissions.length
    console.log(`Deleted ${deletedSubmissions} user submissions`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully cleaned up user submission data`,
        deletedFish,
        deletedSubmissions,
        deletedImages
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