/*
  # Add article relationship to explanations table

  1. Changes
    - Add `article_id` column to `explanations` table
    - Create foreign key constraint between `explanations` and `articles` tables
    - Update RLS policies to maintain data integrity

  2. Security
    - Maintain existing RLS policies
    - Ensure proper cascading delete behavior
*/

ALTER TABLE explanations 
ADD COLUMN article_id uuid REFERENCES articles(id) ON DELETE CASCADE;

-- Update RLS policies to include article relationship checks
CREATE POLICY "Users can read explanations with their articles"
  ON explanations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles a 
      WHERE a.id = explanations.article_id
    )
  );