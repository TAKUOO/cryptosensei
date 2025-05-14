/*
  # Fix RLS policies for articles table

  1. Changes
    - Drop existing RLS policies for articles table
    - Create new RLS policies that properly handle article creation and ownership
  
  2. Security
    - Enable RLS on articles table
    - Add policies for:
      - Authenticated users can create articles
      - Article owners can update and delete their articles
      - All authenticated users can read articles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for article owners" ON articles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable read access for all users" ON articles;
DROP POLICY IF EXISTS "Enable update for article owners" ON articles;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users"
ON articles FOR INSERT
TO authenticated
WITH CHECK (true);

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
    WHERE e.article_id = articles.id AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM explanations e
    WHERE e.article_id = articles.id AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for article owners"
ON articles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM explanations e
    WHERE e.article_id = articles.id AND e.user_id = auth.uid()
  )
);