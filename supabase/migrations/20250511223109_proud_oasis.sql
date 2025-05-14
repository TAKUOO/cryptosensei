/*
  # Fix Articles RLS Policies

  1. Changes
    - Drop existing RLS policies for articles table
    - Create new, properly configured RLS policies
      - Allow authenticated users to read all articles
      - Allow authenticated users to insert new articles
      - Allow users to update and delete their own articles (through explanations)

  2. Security
    - Maintain RLS enabled on articles table
    - Ensure proper authentication checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users" ON articles
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON articles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Enable update for users through explanations" ON articles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM explanations e 
      WHERE e.article_id = id 
      AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM explanations e 
      WHERE e.article_id = id 
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for users through explanations" ON articles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM explanations e 
      WHERE e.article_id = id 
      AND e.user_id = auth.uid()
    )
  );