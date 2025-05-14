/*
  # Add OGP metadata fields to explanations table

  1. Changes
    - Add OGP metadata fields to explanations table if they don't exist
      - `title` (text, nullable)
      - `ogp` (jsonb, default empty object)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'explanations' AND column_name = 'title'
  ) THEN
    ALTER TABLE explanations ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'explanations' AND column_name = 'ogp'
  ) THEN
    ALTER TABLE explanations ADD COLUMN ogp jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;