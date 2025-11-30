-- Migration: Create description_mapping table
-- Description: Stores learned relationships between extract descriptions and classifications

DROP TABLE IF EXISTS description_mapping CASCADE;

CREATE TABLE description_mapping (
    id SERIAL PRIMARY KEY,
    extract_description VARCHAR(500) NOT NULL,
    normalized_description VARCHAR(500) NOT NULL,
    "classificationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updateDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_classification 
        FOREIGN KEY("classificationId") 
        REFERENCES classification(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_user 
        FOREIGN KEY("userId") 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_description_mapping_normalized 
    ON description_mapping(normalized_description);

CREATE INDEX idx_description_mapping_user 
    ON description_mapping("userId");

CREATE INDEX idx_description_mapping_classification 
    ON description_mapping("classificationId");
