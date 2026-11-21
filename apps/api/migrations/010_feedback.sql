CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT CHECK (length(comment) <= 500)
) STRICT;
