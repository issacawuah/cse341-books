# Books and Authors API Week 02 Spec - Version 2

## General Rules (apply to every route)
- All requests and responses use JSON.
- Error responses always use this shape: `{ "message": "..." }`.
- 500 errors always return `{ "message": "Internal server error" }`. Stack traces and database details are never returned.
- Responses contain only the fields in the data model. The MongoDB `_id` field is not returned.
- Request bodies: only the fields listed in the data model are used. Extra fields are ignored and never saved.
- All string fields must be non-empty strings. A value of any other type is rejected with `400`.
- Dates use ISO 8601 format `YYYY-MM-DD` (for example `2026-01-15`) and must be real calendar dates.
- Ids are custom strings (`b1`, `a1`). The id in the URL is the id of the record. A request body can never change a record's id.
- Authentication is out of scope for Week 02.
- Pagination and filtering are out of scope for Week 02.

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the Week 01 book API so each book references an author with `authorId`, and the API supports create, read, update and delete for books. Every book route is documented and testable in Swagger.

### Data Model
Collection: `books`

Fields:
- `id`: string, required, unique, custom id such as `b1`
- `authorId`: string, required, must match the `id` of an existing author
- `title`: string, required
- `publicationDate`: string, required, format `YYYY-MM-DD`

The Week 01 field `author` (a name) is replaced by `authorId`.

### Migration of existing data
1. Create the authors collection with authors `a1`, `a2`, `a3` first.
2. For each existing book in Atlas, add an `authorId` that matches an author and remove the old `author` field.

### Relationship to Authors
A book belongs to one author. The `authorId` value must match the `id` of an existing author document. When creating or updating a book, a missing author is rejected with `400`.

### Routes

#### GET /books
Purpose: Return all books.
- Success: `200`, an array of book objects
- Error: `500`

Example success body:

    [
      {
        "id": "b1",
        "authorId": "a1",
        "title": "Patterns of Light",
        "publicationDate": "2021-08-17"
      }
    ]

#### GET /books/:id
Purpose: Return one book.
- Success: `200`, the book object
- Errors: `404` `{ "message": "Book not found" }`, `500`

#### POST /books
Purpose: Create a book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Checks, in this order:
1. All four fields are present, are non-empty strings, and `publicationDate` is a valid `YYYY-MM-DD` date. Otherwise `400` `{ "message": "id, authorId, title and publicationDate are required" }`.
2. The `id` does not already exist. Otherwise `400` `{ "message": "Book id already exists" }`.
3. The `authorId` matches an existing author. Otherwise `400` `{ "message": "Author not found" }`.

Success: `201`, the new book object (without `_id`).
Error: `500`.

#### PUT /books/:id
Purpose: Update an existing book. The whole book is replaced with the three fields in the body. The `id` stays the same.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Checks, in this order:
1. `authorId`, `title` and `publicationDate` are present, are non-empty strings, and `publicationDate` is a valid date. Otherwise `400` `{ "message": "authorId, title and publicationDate are required" }`.
2. A book with that `id` exists. Otherwise `404` `{ "message": "Book not found" }`.
3. The `authorId` matches an existing author. Otherwise `400` `{ "message": "Author not found" }`.

Success: `200`, the updated book object.
Error: `500`.

#### DELETE /books/:id
Purpose: Delete a book.
- Success: `204`, no body
- Errors: `404` `{ "message": "Book not found" }`, `500`

### Swagger Documentation
Every book route is documented with its tag, parameters, request body with an example, and every status code listed above.

### Deployment Expectations
Every book route works locally and on the deployed Render app. The deployed `/api-docs` page can test every book route.

## Feature 2: Author CRUD Operations

### Goal
Add an authors collection with create, read, update and delete. Every author route is documented and testable in Swagger.

### Data Model
Collection: `authors`

Fields:
- `id`: string, required, unique, custom id such as `a1`
- `name`: string, required
- `birthYear`: number, required, a whole number such as `1975`

### Relationship to Books
Books reference authors with `authorId`. An author cannot be deleted while any book still references that author's `id`.

### Routes

#### GET /authors
Purpose: Return all authors.
- Success: `200`, an array of author objects
- Error: `500`

Example success body:

    [
      {
        "id": "a1",
        "name": "Maya Rivera",
        "birthYear": 1975
      }
    ]

#### GET /authors/:id
Purpose: Return one author.
- Success: `200`, the author object
- Errors: `404` `{ "message": "Author not found" }`, `500`

#### POST /authors
Purpose: Create an author.

Request body:

    {
      "id": "a4",
      "name": "Example Author",
      "birthYear": 1980
    }

Checks, in this order:
1. `id` and `name` are non-empty strings and `birthYear` is a whole number. Otherwise `400` `{ "message": "id, name and birthYear are required" }`.
2. The `id` does not already exist. Otherwise `400` `{ "message": "Author id already exists" }`.

Success: `201`, the new author object (without `_id`).
Error: `500`.

#### PUT /authors/:id
Purpose: Update an existing author. The `id` stays the same.

Request body:

    {
      "name": "Updated Author Name",
      "birthYear": 1981
    }

Checks, in this order:
1. `name` is a non-empty string and `birthYear` is a whole number. Otherwise `400` `{ "message": "name and birthYear are required" }`.
2. An author with that `id` exists. Otherwise `404` `{ "message": "Author not found" }`.

Success: `200`, the updated author object.
Error: `500`.

#### DELETE /authors/:id
Purpose: Delete an author.

Checks, in this order:
1. An author with that `id` exists. Otherwise `404` `{ "message": "Author not found" }`.
2. No book has `authorId` equal to this author's `id`. Otherwise `400` `{ "message": "Author still has books" }` and the author is not deleted.

Success: `204`, no body.
Error: `500`.

### Swagger Documentation
Every author route is documented with its tag, parameters, request body with an example, and every status code listed above.

### Deployment Expectations
Every author route works locally and on the deployed Render app. The deployed `/api-docs` page can test every author route.

## Implementation Notes
- Both collections have a unique index on `id` to prevent duplicate ids.
- Models talk to MongoDB, controllers validate input and choose status codes, and the router connects URLs to controllers.
- Response objects are built from the data model fields, so `_id` is never returned.

## Out of Scope for Week 02
- Authentication and authorization
- Pagination, sorting and filtering
- PATCH routes
- MongoDB `$lookup` joins