/*
  # Create articles and related tables

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `created_at` (timestamp)
    - `important_points`
      - `id` (uuid, primary key)
      - `explanation_id` (uuid, foreign key)
      - `importance` (integer)
      - `content` (text)
      - `explanation` (text)
      - `analogy` (text)
    - `skip_sections`
      - `id` (uuid, primary key)
      - `explanation_id` (uuid, foreign key)
      - `number` (integer)
      - `reason` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and create records
*/

-- Articles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
    CREATE TABLE articles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      url text UNIQUE NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Anyone can read articles"
      ON articles
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can create articles"
      ON articles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Important points table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'important_points') THEN
    CREATE TABLE important_points (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      explanation_id uuid REFERENCES explanations(id) ON DELETE CASCADE,
      importance integer NOT NULL CHECK (importance >= 1 AND importance <= 5),
      content text NOT NULL,
      explanation text NOT NULL,
      analogy text NOT NULL
    );

    ALTER TABLE important_points ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Anyone can read important points"
      ON important_points
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can create important points"
      ON important_points
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Skip sections table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skip_sections') THEN
    CREATE TABLE skip_sections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      explanation_id uuid REFERENCES explanations(id) ON DELETE CASCADE,
      number integer NOT NULL,
      reason text NOT NULL
    );

    ALTER TABLE skip_sections ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Anyone can read skip sections"
      ON skip_sections
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can create skip sections"
      ON skip_sections
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;