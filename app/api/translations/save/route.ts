import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

interface SaveTranslationRequest {
  projectId: string;
  projectName?: string;
  languageCode: string;
  languageName?: string;
  exportFormat: string;
  cleaningMode?: string;
  languagePack: Record<string, any>;
  termsCount?: number;
}

/**
 * POST /api/translations/save
 * Save validated translation data to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to save translations' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SaveTranslationRequest = await request.json();

    // Validate required fields
    if (!body.projectId || !body.languageCode || !body.exportFormat || !body.languagePack) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Missing required fields: projectId, languageCode, exportFormat, languagePack' 
        },
        { status: 400 }
      );
    }

    // Calculate file size
    const languagePackString = JSON.stringify(body.languagePack);
    const fileSizeBytes = new Blob([languagePackString]).size;

    // Prepare data for insertion
    const insertData: any = {
      user_id: user.id,
      project_id: body.projectId,
      project_name: body.projectName || null,
      language_code: body.languageCode,
      language_name: body.languageName || null,
      export_format: body.exportFormat,
      cleaning_mode: body.cleaningMode || null,
      language_pack: body.languagePack,
      terms_count: body.termsCount || Object.keys(body.languagePack).length,
      file_size_bytes: fileSizeBytes,
      created_by: user.id,
      updated_by: user.id,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('language_content_data')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { 
          error: 'Database Error', 
          message: error.message,
          details: error 
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Database Error', message: 'No data returned after insert' },
        { status: 500 }
      );
    }

    const result: any = data;

    return NextResponse.json({
      success: true,
      message: 'Translation saved successfully',
      data: {
        languageVersion: result.language_version,
        version: result.version,
        projectId: result.project_id,
        languageCode: result.language_code,
        createdTime: result.created_time,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving translation:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/translations/save?projectId=xxx&languageCode=xxx
 * Get saved translations for a project/language
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const languageCode = searchParams.get('languageCode');
    const version = searchParams.get('version');

    // Build query with type assertion
    const queryBuilder = supabase
      .from('language_content_data')
      .select('*')
      .eq('user_id' as any, user.id as any)
      .order('created_time', { ascending: false });

    // Apply filters
    let finalQuery: any = queryBuilder;
    
    if (projectId) {
      finalQuery = finalQuery.eq('project_id' as any, projectId as any);
    }

    if (languageCode) {
      finalQuery = finalQuery.eq('language_code' as any, languageCode as any);
    }

    if (version) {
      finalQuery = finalQuery.eq('version' as any, parseInt(version) as any);
    }

    const { data, error } = await finalQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });

  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/translations/save?languageVersion=xxx
 * Delete a saved translation
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const languageVersion = searchParams.get('languageVersion');

    if (!languageVersion) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'languageVersion is required' },
        { status: 400 }
      );
    }

    // Delete from database with type assertion
    const deleteQuery = supabase
      .from('language_content_data')
      .delete()
      .eq('language_version' as any, parseInt(languageVersion) as any)
      .eq('user_id' as any, user.id as any);

    const { error } = await deleteQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database Error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Translation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
