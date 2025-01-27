import { Request, Response } from "express";
import {
	fetchAllBooks,
	addNewBook,
	modifyBook,
	removeBook,
	markAsBorrowed,
	markAsReturned,
	fetchRecommendations,
} from "../services/bookService";
import { Book } from "../models/bookModel";

/**
 * Retrieves all books.
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllBooks = (req: Request, res: Response): void => {
	try {
		const books: Book[] = fetchAllBooks();
		res.status(200).json({ message: "Books retrieved", data: books });
	} catch (error) {
		res.status(500).json({ message: "Error retrieving books" });
	}
};

/**
 * Adds a new book.
 * @param req - Express request object with book details in the body
 * @param res - Express response object
 */
export const addBook = (req: Request, res: Response): void => {
	try {
		const newBook: Partial<Book> = req.body;
		const createdBook: Book = addNewBook(newBook);
		res.status(201).json({ message: "Book added", data: createdBook });
	} catch (error) {
		res.status(500).json({ message: "Error adding book" });
	}
};

/**
 * Updates an existing book by ID.
 * @param req - Express request object with book ID in params and updated data in body
 * @param res - Express response object
 */
export const updateBook = (req: Request, res: Response): void => {
	try {
		const id: string = req.params.id;
		const updatedData: Partial<Book> = req.body;
		const updatedBook: Book | null = modifyBook(id, updatedData);
		if (updatedBook) {
			res.status(200).json({
				message: "Book updated",
				data: updatedBook,
			});
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error updating book" });
	}
};

/**
 * Deletes a book by ID.
 * @param req - Express request object with book ID in params
 * @param res - Express response object
 */
export const deleteBook = (req: Request, res: Response): void => {
	try {
		const id: string = req.params.id;
		const success: boolean = removeBook(id);
		if (success) {
			res.status(200).json({ message: "Book deleted" });
		} else {
			res.status(404).json({ message: "Book not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error deleting book" });
	}
};

/**
 * Marks a book as borrowed.
 * @param req - Express request object with book ID in params and borrower ID in body
 * @param res - Express response object
 */
export const borrowBook = (req: Request, res: Response): void => {
	try {
		const id: string = req.params.id;
		const borrowerId: string = req.body.borrowerId;
		const result: Book | null = markAsBorrowed(id, borrowerId);
		if (result) {
			res.status(200).json({ message: "Book borrowed", data: result });
		} else {
			res.status(404).json({
				message: "Book not found or already borrowed",
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Error borrowing book" });
	}
};

/**
 * Marks a book as returned.
 * @param req - Express request object with book ID in params
 * @param res - Express response object
 */
export const returnBook = (req: Request, res: Response): void => {
	try {
		const id: string = req.params.id;
		const result: Book | null = markAsReturned(id);
		if (result) {
			res.status(200).json({ message: "Book returned" });
		} else {
			res.status(404).json({
				message: "Book not found or not currently borrowed",
			});
		}
	} catch (error) {
		res.status(500).json({ message: "Error returning book" });
	}
};

/**
 * Fetches book recommendations.
 * @param req - Express request object
 * @param res - Express response object
 */
export const getRecommendations = (req: Request, res: Response): void => {
	try {
		const recommendations: Book[] = fetchRecommendations();
		res.status(200).json({
			message: "Recommendations retrieved",
			data: recommendations,
		});
	} catch (error) {
		res.status(500).json({ message: "Error fetching recommendations" });
	}
};