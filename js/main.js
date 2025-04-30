// Configure marked for security
const markedOptions = {
    breaks: true,
    gfm: true,
    sanitize: true
};

// Function to fetch and parse blog posts
async function loadBlogPosts() {
    try {
        const response = await fetch('posts/index.json');
        const posts = await response.json();
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get the container based on the current page
        const container = document.getElementById('blog-posts-container') || 
                         document.getElementById('recent-posts-container');
        
        if (!container) return;
        
        // If we're on the home page, only show 3 recent posts
        const postsToShow = container.id === 'recent-posts-container' ? posts.slice(0, 3) : posts;
        
        postsToShow.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            
            postElement.innerHTML = `
                <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
                <div class="post-meta">
                    <span>${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <p>${post.excerpt}</p>
            `;
            
            container.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Function to load a single blog post
async function loadBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
        console.error('No slug provided in URL');
        return;
    }
    
    try {
        console.log('Loading post with slug:', slug);
        const response = await fetch(`posts/${slug}.md`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        console.log('Markdown content:', markdown);
        
        const postContainer = document.getElementById('blog-post');
        if (!postContainer) {
            console.error('Could not find blog-post element');
            return;
        }
        
        // Convert markdown to HTML using the UMD version of marked
        const html = window.marked.parse(markdown, markedOptions);
        console.log('Converted HTML:', html);
        
        // Update the page title
        document.title = `${slug} - My Blog`;
        
        // Insert the content
        postContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        const postContainer = document.getElementById('blog-post');
        if (postContainer) {
            postContainer.innerHTML = `
                <h1>Error Loading Post</h1>
                <p>Sorry, there was an error loading this post. Please try again later.</p>
                <p>Error details: ${error.message}</p>
            `;
        }
    }
}

// Load content based on the current page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, current path:', window.location.pathname);
    if (window.location.pathname.includes('post.html')) {
        console.log('Loading single post');
        loadBlogPost();
    } else {
        console.log('Loading blog posts list');
        loadBlogPosts();
    }
}); 