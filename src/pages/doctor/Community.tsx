import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Users,
  FileText,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Tag,
  ChevronUp,
  ChevronDown,
  Share2,
  BookmarkPlus,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from "sonner";

// Mock data for forum posts
const MOCK_POSTS = [
  {
    id: 1,
    title: "Unusual presentation of COVID-19 in pediatric patients",
    content: "I've recently encountered several pediatric patients with unusual COVID-19 symptoms. Instead of respiratory symptoms, they're presenting with gastrointestinal issues and skin rashes. Has anyone else observed this pattern?",
    author: "Dr. Sarah Johnson",
    specialty: "Pediatrics",
    date: "2 hours ago",
    upvotes: 24,
    downvotes: 2,
    comments: 8,
    tags: ["COVID-19", "Pediatrics", "Case Discussion"]
  },
  {
    id: 2,
    title: "AI misdiagnosis in radiology - case study",
    content: "I'd like to share a case where our AI system misdiagnosed a lung nodule as benign, but further investigation revealed early-stage cancer. Important reminder to always verify AI results.",
    author: "Dr. Michael Chen",
    specialty: "Radiology",
    date: "5 hours ago",
    upvotes: 42,
    downvotes: 3,
    comments: 15,
    tags: ["AI", "Radiology", "Oncology"]
  },
  {
    id: 3,
    title: "New treatment protocol for resistant hypertension",
    content: "Our hospital has implemented a new protocol for resistant hypertension that's showing promising results. Combining spironolactone with existing therapies has reduced BP in 78% of our difficult cases.",
    author: "Dr. Lisa Patel",
    specialty: "Cardiology",
    date: "1 day ago",
    upvotes: 36,
    downvotes: 4,
    comments: 12,
    tags: ["Cardiology", "Hypertension", "Treatment Protocol"]
  },
  {
    id: 4,
    title: "Seeking second opinion on complex neurological case",
    content: "Patient presents with intermittent tremors, memory lapses, and sensory disturbances but all imaging and standard tests are inconclusive. Considering rare autoimmune encephalitis. Any neurologists willing to review?",
    author: "Dr. James Wilson",
    specialty: "Internal Medicine",
    date: "2 days ago",
    upvotes: 18,
    downvotes: 0,
    comments: 7,
    tags: ["Neurology", "Second Opinion", "Autoimmune"]
  }
];

// Mock data for categories
const CATEGORIES = [
  { id: 1, name: "Case Discussions", icon: FileText, count: 128 },
  { id: 2, name: "Medical Research", icon: FileText, count: 95 },
  { id: 3, name: "AI-Assisted Diagnoses", icon: FileText, count: 64 },
  { id: 4, name: "Drug Interactions", icon: FileText, count: 42 },
  { id: 5, name: "Telemedicine", icon: FileText, count: 37 }
];

const Community = () => {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  
  // Filter posts based on search query and selected category
  const filteredPosts = MOCK_POSTS.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      post.tags.some(tag => {
        const category = CATEGORIES.find(cat => cat.id === selectedCategory);
        return category && tag.includes(category.name);
      });
    
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In a real app, we would send this to an API
    toast.success("Post created successfully!");
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
    setShowNewPostForm(false);
  };

  const handleVote = (postId: number, isUpvote: boolean) => {
    // In a real app, we would update the vote in the database
    toast.success(`${isUpvote ? "Upvoted" : "Downvoted"} post successfully`);
  };

  return (
    <div className="fade-in p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Community Forum</h1>
        <p className="text-gray-500 mt-1">Collaborate with other healthcare professionals</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-white shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Categories</h2>
              </div>
              
              <div className="space-y-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center ${selectedCategory === null ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <span>All Topics</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{MOCK_POSTS.length}</span>
                </button>
                
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between items-center ${selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{category.count}</span>
                  </button>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-gray-50">COVID-19</Badge>
                  <Badge variant="outline" className="bg-gray-50">Cardiology</Badge>
                  <Badge variant="outline" className="bg-gray-50">Oncology</Badge>
                  <Badge variant="outline" className="bg-gray-50">Pediatrics</Badge>
                  <Badge variant="outline" className="bg-gray-50">AI</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card className="bg-white shadow-sm mb-4">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowNewPostForm(true)}
                >
                  Start New Discussion
                </Button>
              </div>

              <Tabs defaultValue="discussions" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discussions">All Discussions</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                </TabsList>
                
                <TabsContent value="discussions" className="mt-4">
                  {filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map(post => (
                        <div key={post.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center space-y-1 text-gray-500">
                              <button 
                                className="hover:text-blue-600 transition-colors"
                                onClick={() => handleVote(post.id, true)}
                              >
                                <ChevronUp className="w-6 h-6" />
                              </button>
                              <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                              <button 
                                className="hover:text-red-600 transition-colors"
                                onClick={() => handleVote(post.id, false)}
                              >
                                <ChevronDown className="w-6 h-6" />
                              </button>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">{post.title}</h3>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Avatar className="w-6 h-6 bg-blue-100 text-blue-600">
                                    <span className="text-xs">{post.author.split(' ').map(n => n[0]).join('')}</span>
                                  </Avatar>
                                  <span>{post.author}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{post.specialty}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{post.date}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{post.comments}</span>
                                  </button>
                                  <button className="text-gray-500 hover:text-blue-600">
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button className="text-gray-500 hover:text-blue-600">
                                    <BookmarkPlus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900">No discussions found</h3>
                      <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="popular" className="mt-4">
                  <div className="space-y-4">
                    {MOCK_POSTS.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)).slice(0, 5).map(post => (
                      <div key={post.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center space-y-1 text-gray-500">
                            <button 
                              className="hover:text-blue-600 transition-colors"
                              onClick={() => handleVote(post.id, true)}
                            >
                              <ChevronUp className="w-6 h-6" />
                            </button>
                            <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                            <button 
                              className="hover:text-red-600 transition-colors"
                              onClick={() => handleVote(post.id, false)}
                            >
                              <ChevronDown className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">{post.title}</h3>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {post.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Avatar className="w-6 h-6 bg-blue-100 text-blue-600">
                                  <span className="text-xs">{post.author.split(' ').map(n => n[0]).join('')}</span>
                                </Avatar>
                                <span>{post.author}</span>
                                <span className="text-gray-400">•</span>
                                <span>{post.specialty}</span>
                                <span className="text-gray-400">•</span>
                                <span>{post.date}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post.comments}</span>
                                </button>
                                <button className="text-gray-500 hover:text-blue-600">
                                  <Share2 className="w-4 h-4" />
                                </button>
                                <button className="text-gray-500 hover:text-blue-600">
                                  <BookmarkPlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="unanswered" className="mt-4">
                  <div className="space-y-4">
                    {MOCK_POSTS.filter(post => post.comments === 0).length > 0 ? (
                      MOCK_POSTS.filter(post => post.comments === 0).map(post => (
                        <div key={post.id} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center space-y-1 text-gray-500">
                              <button 
                                className="hover:text-blue-600 transition-colors"
                                onClick={() => handleVote(post.id, true)}
                              >
                                <ChevronUp className="w-6 h-6" />
                              </button>
                              <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                              <button 
                                className="hover:text-red-600 transition-colors"
                                onClick={() => handleVote(post.id, false)}
                              >
                                <ChevronDown className="w-6 h-6" />
                              </button>
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">{post.title}</h3>
                              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {post.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Avatar className="w-6 h-6 bg-blue-100 text-blue-600">
                                    <span className="text-xs">{post.author.split(' ').map(n => n[0]).join('')}</span>
                                  </Avatar>
                                  <span>{post.author}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{post.specialty}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{post.date}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>{post.comments}</span>
                                  </button>
                                  <button className="text-gray-500 hover:text-blue-600">
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button className="text-gray-500 hover:text-blue-600">
                                    <BookmarkPlus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No unanswered discussions</h3>
                        <p className="text-gray-500 mt-1">All discussions have received responses</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>

          {/* New Post Form */}
          {showNewPostForm && (
            <Card className="bg-white shadow-sm mb-4">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Create New Discussion</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNewPostForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="post-title"
                      placeholder="Enter a descriptive title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="post-content"
                      placeholder="Describe your case or question in detail..."
                      className="min-h-[150px]"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="post-tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <Input
                      id="post-tags"
                      placeholder="e.g. Cardiology, Research, Treatment"
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleCreatePost}
                    >
                      Post Discussion
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;