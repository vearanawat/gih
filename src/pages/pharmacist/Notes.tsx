import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, MessageSquare, User, Calendar } from 'lucide-react';
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'general' | 'medication' | 'protocol' | 'patient';
  comments: {
    id: string;
    author: string;
    content: string;
    date: string;
  }[];
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Updated Medication Protocol',
    content: 'New protocol for handling controlled substances. Please review and acknowledge.',
    author: 'Dr. Smith',
    date: '2024-03-15',
    category: 'protocol',
    comments: [
      {
        id: '1',
        author: 'Jane Doe',
        content: 'Reviewed and implemented in the morning shift.',
        date: '2024-03-15'
      }
    ]
  },
  {
    id: '2',
    title: 'Inventory Alert',
    content: 'Running low on several critical medications. Please check the attached list.',
    author: 'John Smith',
    date: '2024-03-14',
    category: 'medication',
    comments: []
  }
];

const PharmacistNotes = () => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Note['category'] | 'all'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general' as Note['category']
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) {
      toast.error('Please fill in all fields');
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      author: 'Current User',
      date: new Date().toISOString().split('T')[0],
      comments: []
    };

    setNotes(prev => [note, ...prev]);
    setIsCreating(false);
    setNewNote({ title: '', content: '', category: 'general' });
    toast.success('Note created successfully');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast.success('Note deleted successfully');
  };

  const handleAddComment = (noteId: string) => {
    if (!newComment[noteId]) return;

    setNotes(prev =>
      prev.map(note =>
        note.id === noteId
          ? {
              ...note,
              comments: [
                ...note.comments,
                {
                  id: Date.now().toString(),
                  author: 'Current User',
                  content: newComment[noteId],
                  date: new Date().toISOString().split('T')[0]
                }
              ]
            }
          : note
      )
    );

    setNewComment(prev => ({ ...prev, [noteId]: '' }));
    toast.success('Comment added successfully');
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: Note['category']) => {
    switch (category) {
      case 'medication':
        return 'bg-blue-100 text-blue-800';
      case 'protocol':
        return 'bg-purple-100 text-purple-800';
      case 'patient':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Notes</h1>
          <p className="text-gray-500 mt-1">Collaborate and share important information</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card className="bg-white p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="border rounded-md px-3"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Note['category'] | 'all')}
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="medication">Medication</option>
                <option value="protocol">Protocol</option>
                <option value="patient">Patient</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{note.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(note.category)}`}>
                            {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <User className="w-4 h-4" />
                          <span>{note.author}</span>
                          <Calendar className="w-4 h-4 ml-2" />
                          <span>{note.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingNoteId(note.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{note.content}</p>

                    <div className="space-y-3">
                      {note.comments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <User className="w-4 h-4" />
                            <span>{comment.author}</span>
                            <span className="text-gray-400">•</span>
                            <span>{comment.date}</span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment[note.id] || ''}
                          onChange={(e) => setNewComment(prev => ({
                            ...prev,
                            [note.id]: e.target.value
                          }))}
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleAddComment(note.id)}
                          disabled={!newComment[note.id]}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredNotes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notes found.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {isCreating && (
          <Card className="bg-white p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h2>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Content"
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({
                    ...prev,
                    category: e.target.value as Note['category']
                  }))}
                >
                  <option value="general">General</option>
                  <option value="medication">Medication</option>
                  <option value="protocol">Protocol</option>
                  <option value="patient">Patient</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCreateNote}
                >
                  Create Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewNote({ title: '', content: '', category: 'general' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacistNotes; 