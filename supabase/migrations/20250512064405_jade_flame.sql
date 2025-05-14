/*
  # Fix explanations RLS policies

  1. Changes
    - Drop and recreate the INSERT policy for explanations table to ensure proper user_id check
    
  2. Security
    - Maintains RLS enabled on explanations table
    - Updates INSERT policy to properly check user_id matches authenticated user
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create explanations" ON explanations;

-- Create new INSERT policy with proper user_id check
CREATE POLICY "Users can create explanations"
ON explanations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);