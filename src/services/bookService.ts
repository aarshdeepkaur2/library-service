import { Book } from "../models/bookModel";

const books: Book[] = [
    {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Fiction",
        isBorrowed: false,
    },
    {
        id: "2",
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        isBorrowed: false,
    },
    {
        id: "3",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Classic",
        isBorrowed: false,
    },
];

export const getAllBooks = (): Book[] => {
    return books;
};

/**
 * Adds a new book to the library system.
 *
 * The function uses Omit<Book, 'id' | 'isBorrowed' | 'borrowerId' | 'dueDate'> as its parameter type.
 * This means it creates a new type from the Book interface that excludes those specific fields:
 * - 'id' because we generate it automatically
 * - 'isBorrowed' because all new books start as not borrowed
 * - 'borrowerId' and 'dueDate' because they're only used when a book is borrowed
 *
 * @param bookData - The book information. Must include title, author, and genre.
 * @throws {Error} When required fields (title, author, genre) are missing
 * @returns {Book} The newly created book with generated ID and isBorrowed set to false
 *
 * @example
 * const newBook = addBook({
 *     title: "The Great Gatsby",
 *     author: "F. Scott Fitzgerald",
 *     genre: "Fiction"
 * });
 */
export const addBook = (
    bookData: Omit<Book, "id" | "isBorrowed" | "borrowerId" | "dueDate">
): Book => {
    if (!bookData.title || !bookData.author || !bookData.genre) {
        throw new Error(
            "Missing required fields: title, author, and genre are required"
        );
    }

    const newBook: Book = {
        id: (Math.random() * 10000).toFixed(0),
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        isBorrowed: false,
    };

    books.push(newBook);
    return newBook;
};

/**
 * Updates an existing book's information. Certain fields (id, isBorrowed, borrowerId, dueDate)
 * cannot be modified through this function as they are managed by other operations.
 *
 * The Partial<Book> type means all Book fields are optional in the update data.
 * This allows updating only specific fields while leaving others unchanged.
 *
 * @param id - The ID of the book to update
 * @param bookData - Partial book data containing fields to update
 * @throws {Error} When book with given ID is not found
 * @returns {Book} The updated book
 *
 * @example
 * const updatedBook = updateBook("123", {
 *     title: "New Title",
 *     genre: "New Genre"
 * });
 */
export const updateBook = (id: string, bookData: Partial<Book>): Book => {
    const book = books.find((b) => b.id === id);

    if (!book) {
        throw new Error(`Book with ID ${id} not found`);
    }

    // Create a safe version of bookData without protected fields
    const safeUpdate = { ...bookData };

    // The following are the protected fields:
    // Prevent ID changes
    delete safeUpdate.id;
    // These fields should only be modified through borrowBook/returnBook
    delete safeUpdate.isBorrowed;
    delete safeUpdate.borrowerId;
    delete safeUpdate.dueDate;

    Object.assign(book, safeUpdate);
    return book;
};

/**
 * Removes a book from the library system.
 *
 * @param id - The ID of the book to delete
 * @returns {boolean} True if book was found and deleted, false if book was not found
 *
 * @example
 * const wasDeleted = deleteBook("123");
 * if (wasDeleted) {
 *     console.log("Book was successfully deleted");
 * }
 */
export const deleteBook = (id: string): boolean => {
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
        books.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Marks a book as borrowed by a user and sets a due date 14 days from now.
 *
 * @param id - The ID of the book to borrow
 * @param borrowerId - The ID of the user borrowing the book
 * @throws {Error} When book is not found or is already borrowed
 * @returns {Book} The updated book with borrowing information
 *
 */
export const borrowBook = (id: string, borrowerId: string): Book => {
    const book = books.find((b) => b.id === id);

    if (!book) {
        throw new Error(`Book with ID ${id} not found`);
    }

    if (book.isBorrowed) {
        throw new Error(`Book with ID ${id} is already borrowed`);
    }

    book.isBorrowed = true;
    book.borrowerId = borrowerId;

    // 14 days from now
    book.dueDate = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    return book;
};

/**
 * Marks a book as returned, validates borrowing rules, and calculates penalties if overdue.
 *
 * @param id - The ID of the book to return
 * @param borrowerId - The ID of the user returning the book
 * @throws {Error} When book is not found, not currently borrowed, or returned by a non-borrower
 * @returns {Book & { penalty?: number }} The updated book with borrowing information removed and penalty calculated if applicable
 *
 * @example
 * const returnedBook = returnBook("123", "user456");
 * console.log(returnedBook.isBorrowed); // false
 * console.log(returnedBook.penalty); // 4 (if 2 days late)
 */
export const returnBook = (id: string, borrowerId: string): Book & { penalty?: number } => {
    // Check if the book exists in the inventory
    const book = books.find((b) => b.id === id);

    // If no book is found in the inventory, throw an error
    if (!book) {
        throw new Error(`Book with ID ${id} not found in the inventory`);
    }

    // If the book is not borrowed, throw an error
    if (!book.isBorrowed) {
        throw new Error(`Book with ID ${id} is not currently borrowed`);
    }

    // If the borrower is not the one who borrowed the book, throw an error
    if (book.borrowerId !== borrowerId) {
        throw new Error(`Book with ID ${id} was not borrowed by this user`);
    }

    // Check if the book is overdue
    const dueDate = new Date(book.dueDate!); 
    const currentDate = new Date();
    let penalty = 0;

    // Calculate the number of days late
    const daysLate = Math.ceil((currentDate.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000));

    if (daysLate > 0) {
        // If the book is returned after 14 days, charge a penalty of $2 per day
        if (daysLate > 14) {
            penalty = (daysLate - 14) * 2; // $2 per day after 14 days
        }
    }

    // Reset book's borrowing fields
    book.isBorrowed = false;
    delete book.borrowerId;
    delete book.dueDate;

    // Return book with penalty (if applicable)
    return penalty > 0 ? { ...book, penalty } : book;
};

/**
 * Gets a list of recommended books from the library.
 * Right now it returns the first 3 books in the system.
 *
 * @returns {Book[]} Array of up to 3 recommended books
 *
 * @example
 * const recommendations = getRecommendations();
 * console.log(`Got ${recommendations.length} recommendations`);
 */
export const getRecommendations = (): Book[] => {
    return books.slice(0, 3);
};