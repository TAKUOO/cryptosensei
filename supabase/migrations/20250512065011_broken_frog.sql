/*
  # Fix explanations RLS policies

  1. Changes
    - Update RLS policies for explanations table to properly handle user authentication
    - Add policy for authenticated users to create explanations with their user_id
    - Ensure users can only modify their own explanations

  2. Security
    - Enable RLS on explanations table
    - Add policies for authenticated users to manage their explanations
*/

-- Enable RLS
ALTER TABLE explanations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can read explanations" ON explanations;
DROP POLICY IF EXISTS "Users can create explanations" ON explanations;
DROP POLICY IF EXISTS "Users can delete own explanations" ON explanations;
DROP POLICY IF EXISTS "Users can read explanations with their articles" ON explanations;
DROP POLICY IF EXISTS "Users can read own explanations" ON explanations;
DROP POLICY IF EXISTS "Users can update is_public status" ON explanations;
DROP POLICY IF EXISTS "Users can update own explanations" ON explanations;

-- Create new policies
CREATE POLICY "Public explanations are viewable by everyone"
ON explanations FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "Users can read own explanations"
ON explanations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create explanations"
ON explanations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own explanations"
ON explanations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own explanations"
ON explanations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);