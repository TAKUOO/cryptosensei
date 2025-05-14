/*
  # Fix RLS policies for articles table

  1. Changes
    - Drop and recreate RLS policies for articles table to fix permission issues
    - Ensure authenticated users can properly insert new articles
    - Maintain existing read/update/delete policies

  2. Security
    - Maintain RLS enabled on articles table
    - Ensure proper authentication checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
DROP POLICY IF EXISTS "Enable update for article owners" ON articles;
DROP POLICY IF EXISTS "Enable delete for article owners" ON articles;

-- Recreate policies with correct permissions
CREATE POLICY "Enable insert for authenticated users" 
ON articles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable read access for all users" 
ON articles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable update for article owners" 
ON articles FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM explanations e 
    WHERE e.article_id = articles.id 
    AND e.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM explanations e 
    WHERE e.article_id = articles.id 
    AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for article owners" 
ON articles FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM explanations e 
    WHERE e.article_id = articles.id 
    AND e.user_id = auth.uid()
  )
);