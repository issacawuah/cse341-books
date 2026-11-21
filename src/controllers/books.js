import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists
} from '../models/books.js';

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBookHandler = async (req, res) => {
  const { id, authorId, title, publicationDate } = req.body ?? {};

  try {
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(authorId) ||
      !isNonEmptyString(title) ||
      !isValidDate(publicationDate)
    ) {
      return res.status(400).json({ message: 'id, authorId, title and publicationDate are required' });
    }

    const existingBook = await getBookById(id);

    if (existingBook) {
      return res.status(400).json({ message: 'Book id already exists' });
    }

    if (!(await authorExists(authorId))) {
      return res.status(400).json({ message: 'Author not found' });
    }

    const createdBook = await createBook({ id, authorId, title, publicationDate });
    return res.status(201).json(createdBook);
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBookHandler = async (req, res) => {
  const requestedId = req.params.id;
  const { authorId, title, publicationDate } = req.body ?? {};

  try {
    if (!isNonEmptyString(authorId) || !isNonEmptyString(title) || !isValidDate(publicationDate)) {
      return res.status(400).json({ message: 'authorId, title and publicationDate are required' });
    }

    const existingBook = await getBookById(requestedId);

    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!(await authorExists(authorId))) {
      return res.status(400).json({ message: 'Author not found' });
    }

    const updatedBook = await updateBook(requestedId, { authorId, title, publicationDate });
    return res.status(200).json(updatedBook);
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBookHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const existingBook = await getBookById(requestedId);

    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await deleteBook(requestedId);
    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler
};