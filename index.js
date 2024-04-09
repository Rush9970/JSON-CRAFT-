import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";

const app = express();
const port = 3000;
const API_URL = "https://jsonplaceholder.typicode.com";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", { newPost: null });
  
});
app.get("/p1", (req, res) => {
  res.render("p1.ejs", { newPost: null });
});
app.get("/p2", (req, res) => {
  res.render("p2.ejs", { newPost: null });
});
app.get("/posts", (req, res) => {
  res.render("posts.ejs",{ post:null });
});

app.post("/posts", async (req, res) => {
  try {
    const postId = req.body.postId;

    // Fetch post details based on the provided ID
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
    const post = await response.json();

    // Render the posts.ejs template with the retrieved post details
    res.render("posts.ejs", { post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route handler for rendering the form to create a new post
// Route handler for rendering the form to create a new post
app.get("/posts-create", (req, res) => {
  res.render("post-create.ejs", { post: null }); // Render the post-create.ejs template initially with null post data
});

// Route handler for creating a new post
app.post("/posts-create", async (req, res) => {
  try {
    const { title, body, userId } = req.body; // Extracting title, body, and userId from request body

    // Check if all required fields are provided
    if (!title || !body || !userId) {
      return res.status(400).send("Title, body, and userId are required.");
    }

    // Making a POST request to create a new post
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({ title, body, userId }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    
    // Parsing the response as JSON
    const createdPost = await response.json();

    // Rendering the post-create.ejs template with the created post details
    res.render("post-create.ejs", { post: createdPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.get("/posts-update", (req, res) => {
  res.render("update.ejs", { post: null, updatedPost: null });
});

// Route to handle form submission and update the post
app.post("/posts-update", async (req, res) => {
  try {
    const { postId, title, body } = req.body;

    const response = await axios.get(`${API_URL}/posts/${postId}`);
    const post = response.data;

    post.title = title;
    post.body = body;

    const updateResponse = await axios.put(`${API_URL}/posts/${postId}`, post);

    const updatedPost = updateResponse.data;
    res.render("update.ejs", { post, updatedPost }); 
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Error updating post");
  }
});
// Route handler for rendering the patch form
app.get("/posts-patch", (req, res) => {
  res.render("patch.ejs", { updatedPost: null });
});

// Route handler for handling the PATCH request
app.post("/posts-patch", async (req, res) => {
  try {
    const { id, field, value } = req.body; // Get post ID, field to update, and new value from request body

    // Fetch the post to be updated
    const response = await axios.get(`${API_URL}/posts/${id}`);
    const post = response.data;

    // Update the post object based on the field to be updated
    switch (field) {
      case "title":
        post.title = value;
        break;
      case "body":
        post.body = value;
        break;
      default:
        throw new Error("Invalid field specified");
    }

    // Perform the PATCH request
    const updateResponse = await axios.patch(`${API_URL}/posts/${id}`, { [field]: value });

    // Send updated post as response
    const updatedPost = updateResponse.data;
    res.render("patch.ejs", { updatedPost }); // Pass the updated post data to the template
  } catch (error) {
    console.error("Error patching post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route handler for rendering the delete form
app.get("/posts-delete", (req, res) => {
  res.render("delete.ejs", { deletedPostId: null });
});

// Route handler for handling the DELETE request
app.post("/posts-delete", async (req, res) => {
  try {
    const postId = req.body.id;
    await axios.delete(`${API_URL}/posts/${postId}`);

    res.render("delete.ejs", { deletedPostId: postId }); 
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route handler for filtering posts based on userId
app.get("/posts", async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query parameters

    let url = `${API_URL}/posts`;
    if (userId) {
      url += `?userId=${userId}`; // Append userId query parameter if provided
    }

    const response = await axios.get(url);
    const posts = response.data;

    // Log fetched posts in the console
    for (const post of posts) {
      console.log("Id:");
      console.log(post.id);
      console.log("Title:");
      console.log(post.title);
      console.log("Message:");
      console.log(post.body);
      console.log();
    }

    // Pass the fetched posts to the template
    res.render("index.ejs", { posts, newPost: null }); // Assuming newPost is not available here
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route handler for fetching comments for a specific post
// GET route to render comments.ejs initially with null
app.get("/comments", (req, res) => {
  res.render("comments.ejs", { comments: null });
});
app.post("/comments", async (req, res) => {
  try {
    const postId = req.body.postId; // Corrected to retrieve postId from request body

    const response = await axios.get(`${API_URL}/posts/${postId}/comments`);
    const comments = response.data;

    console.log("Comments for Post ID:", postId);
    for (const comment of comments) {
      console.log("Comment ID:", comment.id);
      console.log("Name:", comment.name);
      console.log("Email:", comment.email);
      console.log("Body:", comment.body);
      console.log();
    }

    res.render("comments.ejs", { comments }); // Render comments.ejs with comments data
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/album", (req, res) => {
  res.render("album.ejs", { album:null, photos:null });
});
// POST route to handle form submission and display photos for the given album ID
app.post("/album", async (req, res) => {
  try {
    const albumId = req.body.albumId; // Get album ID from form data

    // Fetch album details
    const response = await axios.get(`${API_URL}/albums/${albumId}`);
    const album = response.data;

    // Fetch photos for the album
    const photosResponse = await axios.get(`${API_URL}/albums/${albumId}/photos`);
    const photos = photosResponse.data;

    res.render("album.ejs", { album, photos }); // Pass album and photos to the template
  } catch (error) {
    console.error("Error fetching album and photos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to render the user page
app.get("/user", (req, res) => {
  res.render("user.ejs", { albums: null });
});

// POST route to handle form submission and fetch albums for the given user ID
app.post("/user", async (req, res) => {
  try {
    const userId = req.body.userId;

    // Fetch albums for the user
    const response = await axios.get(`${API_URL}/users/${userId}/albums`);
    const albums = response.data;

    // Render the user.ejs template with the retrieved albums
    res.render("user.ejs", { albums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to render the todos page
app.get("/todos", (req, res) => {
  res.render("todos.ejs", { todos: null });
});

// POST route to handle form submission and fetch todos for the given user ID
app.post("/todos", async (req, res) => {
  try {
    const userId = req.body.userId;

    // Fetch todos for the user
    const response = await axios.get(`${API_URL}/users/${userId}/todos`);
    const todos = response.data;

    // Render the todos.ejs template with the retrieved todos
    res.render("todos.ejs", { todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to render the user-posts page
app.get("/user-post", (req, res) => {
  res.render("user-post.ejs", { posts: null });
});

// POST route to handle form submission and fetch posts for the given user ID
app.post("/user-post", async (req, res) => {
  try {
    const userId = req.body.userId;

    // Fetch posts for the user
    const response = await axios.get(`${API_URL}/users/${userId}/posts`);
    const posts = response.data;

    // Render the user-post.ejs template with the retrieved posts
    res.render("user-post.ejs", { posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});