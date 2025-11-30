-- Add user_id column to movimentation table
ALTER TABLE movimentation 
ADD COLUMN user_id INTEGER;

-- Add timestamps
ALTER TABLE movimentation
ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE movimentation
ADD COLUMN update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add foreign key constraint
ALTER TABLE movimentation
ADD CONSTRAINT fk_movimentation_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_movimentation_user_id ON movimentation(user_id);

-- Optional: Update existing movimentations with a default user
-- UPDATE movimentation SET user_id = 1 WHERE user_id IS NULL;
-- (Descomente e ajuste o user_id se necessário)
