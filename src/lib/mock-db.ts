// モックデータベース（ローカルテスト用）
interface MockUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockPost {
  _id: string;
  content: string;
  author: {
    userId: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  private users: MockUser[] = [];
  private posts: MockPost[] = [];
  private userCounter = 1;
  private postCounter = 1;

  constructor() {
    // 初期ユーザーを追加
    this.initializeMockUsers();
  }

  private async initializeMockUsers() {
    // テスト用の初期ユーザーを追加
    await this.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true
    });

    await this.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true
    });
  }

  // ユーザー関連
  async createUser(userData: Omit<MockUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockUser> {
    const user: MockUser = {
      _id: `user_${this.userCounter++}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserByUsername(username: string): Promise<MockUser | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user._id === id) || null;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const userIndex = this.users.findIndex(user => user._id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates, updatedAt: new Date() };
    return this.users[userIndex];
  }

  // 投稿関連
  async createPost(postData: Omit<MockPost, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockPost> {
    const post: MockPost = {
      _id: `post_${this.postCounter++}`,
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.posts.push(post);
    return post;
  }

  async findPosts(): Promise<MockPost[]> {
    return this.posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findPostById(id: string): Promise<MockPost | null> {
    return this.posts.find(post => post._id === id) || null;
  }

  async updatePost(id: string, updates: Partial<MockPost>): Promise<MockPost | null> {
    const postIndex = this.posts.findIndex(post => post._id === id);
    if (postIndex === -1) return null;
    
    this.posts[postIndex] = { ...this.posts[postIndex], ...updates, updatedAt: new Date() };
    return this.posts[postIndex];
  }

  async deletePost(id: string): Promise<boolean> {
    const postIndex = this.posts.findIndex(post => post._id === id);
    if (postIndex === -1) return false;
    
    this.posts.splice(postIndex, 1);
    return true;
  }
}

export const mockDB = new MockDatabase();

// パスワード比較のモック
export const comparePassword = async (hashedPassword: string, plainPassword: string): Promise<boolean> => {
  // 簡易的な比較（実際のプロダクションではbcryptを使用）
  return hashedPassword === plainPassword;
};

// パスワードハッシュ化のモック
export const hashPassword = async (password: string): Promise<string> => {
  // 簡易的なハッシュ化（実際のプロダクションではbcryptを使用）
  return password;
}; 