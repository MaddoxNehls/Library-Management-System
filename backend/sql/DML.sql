-- =========================================
--  DML.SQL for Our Library Management System
--  Group 62 - DataDynamos
--  Authors: Maddox Nehls, Tristen Beaudoin
-- =========================================

SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;

-- =========================================
--  inventory_books.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Books on inventory_books.html page
SELECT Books.isbn, Books.title, 
       GROUP_CONCAT(DISTINCT CONCAT(Authors.firstName, ' ', Authors.lastName) SEPARATOR ', ') AS authors, 
       GROUP_CONCAT(DISTINCT Genres.genreName SEPARATOR ', ') AS genres, 
       Books.publicationYear, Books.edition, 
       COUNT(DISTINCT Copies.copyID) AS numberOfCopies
FROM Books
  LEFT JOIN Copies ON Books.isbn = Copies.isbn
  INNER JOIN BookAuthors ON Books.isbn = BookAuthors.isbn
  INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID
  INNER JOIN BookGenres ON Books.isbn = BookGenres.isbn
  INNER JOIN Genres ON BookGenres.genreID = Genres.genreID
GROUP BY Books.isbn
ORDER BY Books.isbn ASC;

-- Insert new Book entry from input on inventory_books_add.html page
INSERT INTO Books (isbn, title, publicationYear, edition) VALUES
  (9780451526342, 'Animal Farm', 1945, '1st');

-- Insert new BookAuthor entry from input and drop-down menu on inventory_books_add.html page AND inventory_books_edit.html page
INSERT INTO BookAuthors (isbn, authorID) VALUES
  (9780451526342, (SELECT authorID FROM Authors WHERE CONCAT(firstName, ' ', lastName) = 'George Orwell'));

-- Insert new BookGenre entry from input and drop-down menu on inventory_books_add.html page AND inventory_books_edit.html page
INSERT INTO BookGenres (isbn, genreID) VALUES
  (9780451526342, (SELECT genreID FROM Genres WHERE genreName = 'Fiction'));

-- Display all Author names for drop-down menu on inventory_books_add.html page AND inventory_books_edit.html page
SELECT CONCAT(firstName, ' ', lastName) AS authorName
FROM Authors
ORDER BY lastName ASC;

-- Display all Genre names for drop-down menu on inventory_books_add.html page AND inventory_books_edit.html page
SELECT genreName
FROM Genres
ORDER BY genreName ASC;

-- Display Book entry on inventory_book_edit.html page AND inventory_copies_add.html page
SELECT Books.isbn, Books.title, 
       GROUP_CONCAT(DISTINCT CONCAT(Authors.firstName, ' ', Authors.lastName) SEPARATOR ', ') AS authors, 
       GROUP_CONCAT(DISTINCT Genres.genreName SEPARATOR ', ') AS genres, 
       Books.publicationYear, Books.edition
FROM Books
  INNER JOIN BookAuthors ON Books.isbn = BookAuthors.isbn
  INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID
  INNER JOIN BookGenres ON Books.isbn = BookGenres.isbn
  INNER JOIN Genres ON BookGenres.genreID = Genres.genreID
WHERE Books.isbn = 9780743273565;

-- Update Book entry with input on inventory_books_edit.html page
UPDATE Books
  SET title = 'The Animal Farm', publicationYear = 1965, edition = '2nd'
  WHERE isbn = 9780451526342;

-- Delete BookAuthor entry on inventory_books_edit.html page
DELETE FROM BookAuthors
  WHERE isbn = 9780451526342 
    AND authorID = (SELECT authorID FROM Authors WHERE CONCAT(firstName, ' ', lastName) = 'George Orwell');

-- Delete BookGenre entry on inventory_books_edit.html page
DELETE FROM BookGenres
  WHERE isbn = 9780451526342 
    AND genreID = (SELECT genreID FROM Genres WHERE genreName = 'Fiction');

-- Display Book entry on inventory_book_delete.html page
SELECT Books.isbn, Books.title, 
       GROUP_CONCAT(DISTINCT CONCAT(Authors.firstName, ' ', Authors.lastName) SEPARATOR ', ') AS authors, 
       GROUP_CONCAT(DISTINCT Genres.genreName SEPARATOR ', ') AS genres, 
       Books.publicationYear, Books.edition,
       COUNT(DISTINCT Copies.copyID) AS numberOfCopies
FROM Books
  LEFT JOIN Copies ON Books.isbn = Copies.isbn
  INNER JOIN BookAuthors ON Books.isbn = BookAuthors.isbn
  INNER JOIN Authors ON BookAuthors.authorID = Authors.authorID
  INNER JOIN BookGenres ON Books.isbn = BookGenres.isbn
  INNER JOIN Genres ON BookGenres.genreID = Genres.genreID
WHERE Books.isbn = 9780743273565;

-- Delete Book entry on inventory_books_delete.html page
DELETE FROM Books
  WHERE isbn = 9780451526342;

-- =========================================
--  inventory_authors.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Authors on inventory_authors.html page
SELECT Authors.authorID, Authors.firstName, Authors.lastName, COUNT(BookAuthors.isbn) AS numberOfBooks
FROM Authors 
  LEFT JOIN BookAuthors ON Authors.authorID = BookAuthors.authorID
GROUP BY Authors.authorID
ORDER BY Authors.authorID ASC;

-- Insert new Author entry from input on inventory_authors_add.html page
INSERT INTO Authors (firstName, lastName) VALUES
  ('Mark', 'Twain');

-- Display Author entry on inventory_authors_edit.html page
SELECT authorID, firstName, lastName
FROM Authors
WHERE authorID = 7;

-- Update Author entry with input on inventory_authors_edit.html page
UPDATE Authors
  SET firstName = 'Marc', lastName = 'Twane'
  WHERE authorID = 7;

-- Display Author entry on inventory_authors_delete.html page
SELECT Authors.authorID, Authors.firstName, Authors.lastName, COUNT(BookAuthors.isbn) AS numberOfBooks
FROM Authors 
  LEFT JOIN BookAuthors ON Authors.authorID = BookAuthors.authorID
WHERE Authors.authorID = 4
GROUP BY Authors.authorID;

-- Delete Author entry on inventory_authors_delete.html page
DELETE FROM Authors
  WHERE authorID = 7;

-- =========================================
--  inventory_genres.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Genres on inventory_genres.html page
SELECT Genres.genreID, Genres.genreName, COUNT(BookGenres.isbn) AS numberOfBooks
FROM Genres 
  LEFT JOIN BookGenres ON Genres.genreID = BookGenres.genreID
GROUP BY Genres.genreID
ORDER BY Genres.genreID ASC;

-- Insert new Genre entry from input on inventory_genres_add.html page
INSERT INTO Genres (genreName) VALUES
  ('Romance');

-- Display Genre entry on inventory_genres_edit.html page
SELECT genreID, genreName
FROM Genres
WHERE genreID = 8;

-- Update Genre entry with input on inventory_genres_edit.html page
UPDATE Genres
  SET genreName = 'Romantic'
  WHERE genreID = 8;

-- Display Genre entry on inventory_genres_delete.html page
SELECT Genres.genreID, Genres.genreName, COUNT(BookGenres.isbn) AS numberOfBooks
FROM Genres 
  LEFT JOIN BookGenres ON Genres.genreID = BookGenres.genreID
WHERE Genres.genreID = 2
GROUP BY Genres.genreID;

-- Delete Genre entry on inventory_genres_delete.html page
DELETE FROM Genres
  WHERE genreID = 8;

-- =========================================
--  inventory_copies.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Copies on inventory_copies.html page
SELECT Copies.copyID, Books.isbn, Books.title, Books.edition, CopyStatuses.statusDescription AS status
FROM Copies
  INNER JOIN Books ON Copies.isbn = Books.isbn
  INNER JOIN CopyStatuses ON Copies.copyStatusID = CopyStatuses.copyStatusID
ORDER BY Copies.copyID ASC;

-- Insert new Copy entry on inventory_copies_add.html page
INSERT INTO Copies (isbn, copyStatusID) VALUES
  (9780451524935, 1);

-- Display Copy entry on inventory_copies_edit.html page AND inventory_copies_delete.html page
SELECT Copies.copyID, Books.isbn, Books.title, Books.edition, CopyStatuses.statusDescription AS status
FROM Copies
  INNER JOIN Books ON Copies.isbn = Books.isbn
  INNER JOIN CopyStatuses ON Copies.copyStatusID = CopyStatuses.copyStatusID
WHERE Copies.copyID = 9;

-- Display Book details dynamically as updated isbn is entered on inventory_copies_edit.html page
SELECT title, edition AS status
FROM Books
WHERE isbn = 9780451524935;

-- Update Copy entry with input on inventory_copies_edit.html page
UPDATE Copies
  SET isbn = 9780143039433
  WHERE copyID = 9;

-- Delete Copy entry on inventory_copies_delete.html page
DELETE FROM Copies
  WHERE copyID = 9;

-- =========================================
--  patrons.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Patrons on patrons.html page
SELECT Patrons.patronID, Patrons.firstName, Patrons.lastName, Patrons.email, Patrons.phone, 
       COUNT(Loans.loanID) AS loanCount, 
       COUNT(CASE WHEN Loans.loanStatusID = 2 THEN 1 END) AS overdueCount
FROM Patrons
  LEFT JOIN Loans ON Patrons.patronID = Loans.patronID
GROUP BY Patrons.patronID
ORDER BY Patrons.patronID ASC;

-- Insert new Patron entry from input on patrons_add.html page
INSERT INTO Patrons (firstName, lastName, email, phone) VALUES
  ('Mary', 'Oliver', 'mary.oliver@example.com', '555-555-5555');

-- Display Patron entry on patrons_edit.html page
SELECT patronID, firstName, lastName, email, phone
FROM Patrons
WHERE patronID = 6;

-- Update Patron entry with input on patrons_edit.html page
UPDATE Patrons
  SET firstName = 'Merry', lastName = 'Alliver', email = 'merry.alliver@example.com', phone = '123-456-7890'
  WHERE patronID = 6;

-- Display Patron entry on patrons_delete.html page
SELECT Patrons.patronID, Patrons.firstName, Patrons.lastName, Patrons.email, Patrons.phone, COUNT(Loans.loanID) AS loanCount
FROM Patrons
  LEFT JOIN Loans ON Patrons.patronID = Loans.patronID
WHERE Patrons.patronID = 3
GROUP BY Patrons.patronID;

-- Delete Patron entry on patrons_delete.html page
DELETE FROM Patrons
  WHERE patronID = 6;

-- =========================================
--  loans.html pages (view all, add, edit, delete)
-- =========================================

-- Display all Loans on loans.html page
SELECT Loans.loanID, Patrons.patronID, CONCAT(Patrons.firstName, ' ', Patrons.lastName) AS patronName, 
       Copies.copyID, Books.title, Books.edition, 
       Loans.checkoutDate, Loans.dueDate, IFNULL(Loans.returnedDate, ' ') AS returnedDate, LoanStatuses.statusDescription
FROM Loans
  INNER JOIN Patrons ON Loans.patronID = Patrons.patronID
  INNER JOIN Copies ON Loans.copyID = Copies.copyID
  INNER JOIN Books ON Copies.isbn = Books.isbn
  INNER JOIN LoanStatuses ON Loans.loanStatusID = LoanStatuses.loanStatusID
ORDER BY Loans.loanID;

-- Display all Patron names for drop-down menu on loans_add.html page
SELECT DISTINCT CONCAT(firstName, ' ', lastName) AS patronName
FROM Patrons
ORDER BY lastName ASC;

-- Display all phone numbers that match the Patron name selected from drop-down menu on loans_add.html page
SELECT phone
FROM Patrons
WHERE CONCAT(firstName, ' ', lastName) = 'Jane Smith';

-- Display Book details dynamically as copyID is entered on loans_add.html page
SELECT Books.title, Books.edition
FROM Books
  INNER JOIN Copies ON Copies.isbn = Books.isbn
WHERE Copies.copyID = 2;

-- Insert new Loan from input on loans_add.html page
INSERT INTO Loans (patronID, copyID, loanStatusID, checkoutDate, dueDate) VALUES
  ((SELECT patronID FROM Patrons WHERE CONCAT(firstName, ' ', lastName) = 'Mary Williams' AND phone = '958-555-2345'), 
   2, 1, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 MONTH));

-- Update Copy status to "Checked-Out" when new Loan is inserted on loans_add.html page
UPDATE Copies
  SET copyStatusID = 2
  WHERE copyID = 2;

-- Update Loan status to "Overdue" for all active Loans for which the dueDate has passed
UPDATE Loans
  SET loanStatusID = 2
  WHERE loanStatusID = 1 AND CURRENT_DATE > dueDate;

-- Display Loan entry on loans_edit.html page
SELECT Loans.loanID, Patrons.patronID, CONCAT(Patrons.firstName, ' ', Patrons.lastName) AS patronName, 
       Copies.copyID, Books.title, Books.edition, 
       Loans.checkoutDate, Loans.dueDate
FROM Loans
  INNER JOIN Patrons ON Loans.patronID = Patrons.patronID
  INNER JOIN Copies ON Loans.copyID = Copies.copyID
  INNER JOIN Books ON Copies.isbn = Books.isbn
WHERE Loans.loanID = 7;

-- Update Loan status to "Returned" and returnedDate to today's date when Loan is returned on loans_edit.html page
UPDATE Loans
  SET loanStatusID = 3, returnedDate = CURRENT_DATE
  WHERE loanID = 7;

-- Update Copy status to "Available" when Loan is returned on loans_edit.html page or when Loan is deleted on loans_delete.html page
UPDATE Copies
  SET copyStatusID = 1
  WHERE copyID = 7;

-- Display Loan entry on loans_delete.html page
SELECT Loans.loanID, Patrons.patronID, CONCAT(Patrons.firstName, ' ', Patrons.lastName) AS patronName, 
       Copies.copyID, Books.title, Books.edition, 
       Loans.checkoutDate, Loans.dueDate, IFNULL(Loans.returnedDate, ' ') AS returnedDate, LoanStatuses.statusDescription
FROM Loans
  INNER JOIN Patrons ON Loans.patronID = Patrons.patronID
  INNER JOIN Copies ON Loans.copyID = Copies.copyID
  INNER JOIN Books ON Copies.isbn = Books.isbn
  INNER JOIN LoanStatuses ON Loans.loanStatusID = LoanStatuses.loanStatusID
WHERE Loans.loanID = 1;

-- Delete Loan entry on loans_delete.html page
DELETE FROM Loans
  WHERE loanID = 7;

-- =========================================
--  Finalize
-- =========================================

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
