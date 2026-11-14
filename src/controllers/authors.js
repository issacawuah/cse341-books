import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorInDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks
} from '../models/authors.js';

const isNonEmptyString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

const isWholeNumber = (value) => {
  return Number.isInteger(value);
};

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors);
  } catch (error) {
    console.error('GET /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAuthorById = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const author = await getAuthorByIdFromDb(requestedId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('GET /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createAuthor = async (req, res) => {
  const { id, name, birthYear } = req.body ?? {};

  try {
    if (!isNonEmptyString(id) || !isNonEmptyString(name) || !isWholeNumber(birthYear)) {
      return res.status(400).json({ message: 'id, name and birthYear are required' });
    }

    const existingAuthor = await getAuthorByIdFromDb(id);

    if (existingAuthor) {
      return res.status(400).json({ message: 'Author id already exists' });
    }

    const createdAuthor = await createAuthorInDb({ id, name, birthYear });
    return res.status(201).json(createdAuthor);
  } catch (error) {
    console.error('POST /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAuthor = async (req, res) => {
  const requestedId = req.params.id;
  const { name, birthYear } = req.body ?? {};

  try {
    if (!isNonEmptyString(name) || !isWholeNumber(birthYear)) {
      return res.status(400).json({ message: 'name and birthYear are required' });
    }

    const existingAuthor = await getAuthorByIdFromDb(requestedId);

    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const updatedAuthor = await updateAuthorInDb(requestedId, { name, birthYear });
    return res.status(200).json(updatedAuthor);
  } catch (error) {
    console.error('PUT /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAuthor = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const existingAuthor = await getAuthorByIdFromDb(requestedId);

    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }

    if (await authorHasBooks(requestedId)) {
      return res.status(400).json({ message: 'Author still has books' });
    }

    await deleteAuthorFromDb(requestedId);
    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export { getAllAuthors, getAuthorById, createAuthor, updateAuthor, deleteAuthor };