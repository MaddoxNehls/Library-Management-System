-- =========================================
--  DDL.SQL for Our Library Management System
--  Group 62 - DataDynamos
--  Authors: Maddox Nehls, Tristen Beaudoin
-- =========================================

SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;

-- Drop tables if they exist (in proper order)
DROP TABLE IF EXISTS BookAuthors;
DROP TABLE IF EXISTS BookGenres;
DROP TABLE IF EXISTS Loans;
DROP TABLE IF EXISTS Patrons;
DROP TABLE IF EXISTS LoanStatuses;
DROP TABLE IF EXISTS Copies;
DROP TABLE IF EXISTS CopyStatuses;
DROP TABLE IF EXISTS Books;
DROP TABLE IF EXISTS Authors;
DROP TABLE IF EXISTS Genres;

-- =========================================
--  CREATE TABLES
-- =========================================

CREATE TABLE Books (
  isbn BIGINT NOT NULL, -- Changed from INT to BIGINT
  title VARCHAR(200) NOT NULL,
  publicationYear INT NOT NULL,
  edition VARCHAR(50),
  PRIMARY KEY (isbn)
);

CREATE TABLE Authors (
  authorID INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  PRIMARY KEY (authorID)
);

CREATE TABLE Genres (
  genreID INT NOT NULL AUTO_INCREMENT,
  genreName VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (genreID)
);

CREATE TABLE BookAuthors (
  isbn BIGINT NOT NULL, -- Changed from INT to BIGINT
  authorID INT NOT NULL,
  PRIMARY KEY (isbn, authorID),
  FOREIGN KEY (isbn) 
    REFERENCES Books(isbn)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (authorID)
    REFERENCES Authors(authorID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE BookGenres (
  isbn BIGINT NOT NULL, -- Changed from INT to BIGINT
  genreID INT NOT NULL,
  PRIMARY KEY(isbn, genreID),
  FOREIGN KEY (isbn) 
    REFERENCES Books(isbn)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (genreID)
    REFERENCES Genres(genreID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE CopyStatuses (
  copyStatusID INT NOT NULL AUTO_INCREMENT,
  statusDescription VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (copyStatusID)
);

CREATE TABLE Copies (
  copyID INT NOT NULL AUTO_INCREMENT,
  isbn BIGINT NOT NULL, -- Changed from INT to BIGINT
  copyStatusID INT NOT NULL,
  PRIMARY KEY(copyID),
  FOREIGN KEY(isbn) 
    REFERENCES Books(isbn)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY(copyStatusID) 
    REFERENCES CopyStatuses(copyStatusID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE Patrons (
  patronID INT NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY(patronID)
);

CREATE TABLE LoanStatuses (
  loanStatusID INT NOT NULL AUTO_INCREMENT,
  statusDescription VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (loanStatusID)
);

CREATE TABLE Loans (
  loanID INT NOT NULL AUTO_INCREMENT,
  patronID INT,
  copyID INT,
  loanStatusID INT NOT NULL,
  checkoutDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  returnedDate DATE,
  PRIMARY KEY(loanID),
  FOREIGN KEY(patronID) 
    REFERENCES Patrons(patronID)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY(copyID) 
    REFERENCES Copies(copyID)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY(loanStatusID)
    REFERENCES LoanStatuses(loanStatusID)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

-- =========================================
--  INSERT SAMPLE DATA
-- =========================================

-- Books
INSERT INTO Books (isbn, title, publicationYear, edition) VALUES
  (9780451524935, '1984', 1949, '1st'),
  (9780316769488, 'The Catcher in the Rye', 1951, '1st'),
  (9780743273565, 'The Great Gatsby', 1925, '2nd'),
  (9780140177398, 'Of Mice and Men', 1937, '1st'),
  (9780143039433, 'The Grapes of Wrath', 1939, '1st'),
  (9781324004899, 'The Art of War', 2020, 'Michael Nylan Translaton'),
  (9781789430059, 'The Art of War', 2018, 'Lionel Giles Translation');

-- Authors
INSERT INTO Authors (firstName, lastName) VALUES
  ('George', 'Orwell'),
  ('J.D.', 'Salinger'),
  ('F. Scott', 'Fitzgerald'),
  ('John', 'Steinbeck'),
  ('Sun', 'Tzu'),
  ('William', 'Shakespeare');

-- BookAuthors (intersection table)
INSERT INTO BookAuthors (isbn, authorID) VALUES
  (9780451524935, 1),
  (9780316769488, 2),
  (9780743273565, 3),
  (9780140177398, 4),
  (9780143039433, 4),
  (9781324004899, 5),
  (9781789430059, 5);

-- Genres
INSERT INTO Genres (genreName) VALUES
  ('Nonfiction'),
  ('Fiction'),
  ('Classic'),
  ('Historical Fiction'),
  ('Philosophy'),
  ('Fantasy'),
  ('Dystopian');

-- BookGenres (intersection table)
INSERT INTO BookGenres (isbn, genreID) VALUES
  (9780451524935, 2),
  (9780451524935, 3),
  (9780451524935, 7),
  (9780316769488, 2),
  (9780316769488, 3),
  (9780743273565, 2),
  (9780743273565, 4),
  (9780140177398, 2),
  (9780140177398, 4),
  (9780143039433, 2), 
  (9780143039433, 4), 
  (9781324004899, 1),
  (9781324004899, 5),
  (9781789430059, 1),
  (9781789430059, 5);

-- CopyStatuses
INSERT INTO CopyStatuses (statusDescription) VALUES
  ('Available'),
  ('Checked-Out');

-- Copies
INSERT INTO Copies (isbn, copyStatusID) VALUES
  (9780451524935, 2),  -- copyID 1
  (9780316769488, 1),  -- copyID 2
  (9780743273565, 2),  -- copyID 3
  (9780743273565, 2),  -- copyID 4
  (9780140177398, 1),  -- copyID 5
  (9780140177398, 1),  -- copyID 6
  (9780143039433, 2),  -- copyID 7
  (9781789430059, 1);  -- copyID 8

-- Patrons
INSERT INTO Patrons (firstName, lastName, email, phone) VALUES
  ('John', 'Doe', 'john.doe@example.com', '951-555-1234'),
  ('Jane', 'Smith', 'jane.smith@example.com', '958-555-5678'),
  ('Tim', 'Johnson', 'tim.johnson@example.com', '958-555-3456'),
  ('Jane', 'Smith', 'jane_smith@example.com', '951-555-6789'),
  ('Mary', 'Williams', 'mary.williams@example.com', '958-555-2345');

-- LoanStatuses
INSERT INTO LoanStatuses (statusDescription) VALUES
  ('Active'),
  ('Overdue'),
  ('Returned');

-- Loans
INSERT INTO Loans (patronID, copyID, loanStatusID, checkoutDate, dueDate, returnedDate) VALUES
  (1, 1, 2, '2025-01-01', '2025-02-01', NULL),
  (1, 3, 1, '2025-01-05', '2025-02-05', NULL),
  (2, 7, 3, '2025-01-10', '2025-02-10', '2025-01-30'),
  (3, 4, 1, '2025-01-15', '2025-02-15', NULL),
  (4, 5, 3, '2025-01-20', '2025-02-20', '2025-02-01'),
  (3, 7, 1, '2025-01-25', '2025-02-25', NULL);

-- Finalize 
SET FOREIGN_KEY_CHECKS=1;
COMMIT;
