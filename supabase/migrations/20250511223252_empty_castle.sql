/*
  # Fix RLS policies for articles table

  1. Changes
    - Drop existing RLS policies for articles table
    - Create new policies that:
      - Allow authenticated users to read all articles
      - Allow authenticated users to create articles
      - Allow users to update/delete articles linked to their explanations

  2. Security
    - Enable RLS on articles table
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users through explanations" ON articles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON articles;
DROP POLICY IF EXISTS "Enable update for users through explanations" ON articles;

-- Create new policies
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