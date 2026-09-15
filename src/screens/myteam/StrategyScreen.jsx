/**
 * src/screens/myteam/StrategyScreen.jsx
 *
 * Tagged notes (template/differential/bench-fodder) + season notes board,
 * persisted locally.
 */

import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { useDraftStore } from '@/state/useDraftStore';

const TAGS = ['template', 'differential', 'bench-fodder', 'injury', 'price-rise', 'custom'];

export function StrategyScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const draft = useDraftStore(s => s.getSelectedDraft());
  const [noteText, setNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const notes = draft?.notes || [];

  const handleAddNote = () => {
    if (!noteText.trim() || !draft) return;
    const newNote = {
      id: Date.now().toString(),
      text: noteText.trim(),
      tags: selectedTags,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...notes, newNote];
    useDraftStore.getState().updateDraft(draft.id, { notes: updatedNotes });
    setNoteText('');
    setSelectedTags([]);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const deleteNote = (noteId) => {
    if (!draft) return;
    const updatedNotes = notes.filter(n => n.id !== noteId);
    useDraftStore.getState().updateDraft(draft.id, { notes: updatedNotes });
  };

  if (!activeTeam) {
    return (
      <View className="flex-1 bg-secondary p-5">
        <Text className="text-text-secondary">No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Strategy
        </Text>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-2 uppercase">
            Add Note
          </Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Write a note..."
            placeholderTextColor={colors.text.secondary}
            className="bg-surface text-text-primary rounded-lg p-3 text-sm mb-3 min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
            multiline
          />

          <View className="flex-row flex-wrap gap-2 mb-3">
            {TAGS.map(tag => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded border ${selectedTags.includes(tag) ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-xs font-semibold capitalize ${selectedTags.includes(tag) ? 'text-secondary' : 'text-text-primary'}`}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button title="Add Note" onPress={handleAddNote} />
        </Card>

        <View>
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Notes ({notes.length})
          </Text>
          {notes.map(note => (
            <Card key={note.id} className="mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-text-primary text-sm flex-1">
                  {note.text}
                </Text>
                <Pressable onPress={() => deleteNote(note.id)} className="ml-2">
                  <Text className="text-status-danger text-xs">Delete</Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-1.5">
                {note.tags.map(tag => (
                  <View key={tag} className="px-2 py-1 rounded bg-accent-muted">
                    <Text className="text-primary text-[11px] capitalize">
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-text-secondary text-[11px] mt-2">
                {new Date(note.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          ))}
          {notes.length === 0 && (
            <Text className="text-text-secondary text-[13px]">
              No notes yet. Add your first strategy note above.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
