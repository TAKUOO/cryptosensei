/*
  # Fix Articles Table RLS Policies

  1. Changes
    - Drop existing RLS policies for articles table
    - Create new, properly configured RLS policies
      - Allow authenticated users to insert articles
      - Allow article owners to update and delete their articles
      - Allow all authenticated users to read articles
  
  2. Security
    - Maintain RLS enabled on articles table
    - Ensure proper access control based on authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for article owners" ON articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
DROP POLICY IF EXISTS "Enable update for article owners" ON articles;

-- Create new policies with proper security checks
CREATE POLICY "Enable read access for all users"
ON articles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON articles FOR INSERT
TO authenticated
WITH CHECK (true);

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