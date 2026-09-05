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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Strategy
        </Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Add Note
          </Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Write a note..."
            placeholderTextColor={colors.text.secondary}
            style={{
              backgroundColor: colors.bg.surface,
              color: colors.text.primary,
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              marginBottom: 12,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            multiline
          />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {TAGS.map(tag => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: selectedTags.includes(tag) ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: selectedTags.includes(tag) ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: selectedTags.includes(tag) ? colors.bg.primary : colors.text.primary,
                  fontSize: 12,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}>
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button title="Add Note" onPress={handleAddNote} />
        </Card>

        <View>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Notes ({notes.length})
          </Text>
          {notes.map(note => (
            <Card key={note.id} style={{ padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, flex: 1 }}>
                  {note.text}
                </Text>
                <Pressable onPress={() => deleteNote(note.id)} style={{ marginLeft: 8 }}>
                  <Text style={{ color: colors.status.danger, fontSize: 12 }}>Delete</Text>
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {note.tags.map(tag => (
                  <View key={tag} style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    backgroundColor: colors.accent.primaryMuted,
                  }}>
                    <Text style={{ color: colors.accent.primary, fontSize: 11, textTransform: 'capitalize' }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: 11, marginTop: 8 }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          ))}
          {notes.length === 0 && (
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
              No notes yet. Add your first strategy note above.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
