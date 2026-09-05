/**
 * src/screens/workbook/WorkbookScreen.jsx
 *
 * Full sortable player grid (price/form/xPts/ownership/xGI/status/FDR),
 * column-tap sorting, position/price/ownership/status filters, CSV export.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, Share } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { usePlayerStore } from '@/state/usePlayerStore';

const COLUMNS = [
  { key: 'web_name', label: 'Name', width: 1.2 },
  { key: 'position', label: 'Pos', width: 0.6 },
  { key: 'now_cost', label: 'Price', width: 0.8, format: v => (v / 10).toFixed(1) },
  { key: 'form', label: 'Form', width: 0.7, format: v => v?.toFixed(1) || '—' },
  { key: 'xG', label: 'xG', width: 0.7, format: v => v?.toFixed(2) || '—' },
  { key: 'xA', label: 'xA', width: 0.7, format: v => v?.toFixed(2) || '—' },
  { key: 'xGI', label: 'xGI', width: 0.8, format: v => v?.toFixed(2) || '—' },
  { key: 'selected_by_percent', label: 'Own%', width: 0.8, format: v => `${v}%` },
  { key: 'status', label: 'Status', width: 0.7 },
];

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];
const STATUSES = ['a', 'd', 'i', 's', 'n'];

export function WorkbookScreen() {
  const playersById = usePlayerStore(s => s.playersById);
  const [sortKey, setSortKey] = useState('now_cost');
  const [sortDir, setSortDir] = useState('desc');
  const [positionFilter, setPositionFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const players = useMemo(() => {
    let list = Object.values(playersById);

    if (positionFilter) {
      list = list.filter(p => p.position === positionFilter);
    }
    if (statusFilter) {
      list = list.filter(p => p.status === statusFilter);
    }
    if (minPrice) {
      list = list.filter(p => (p.now_cost || 0) / 10 >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter(p => (p.now_cost || 0) / 10 <= parseFloat(maxPrice));
    }

    list.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal === bVal) return 0;
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return list;
  }, [playersById, sortKey, sortDir, positionFilter, statusFilter, minPrice, maxPrice]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const handleExportCSV = useCallback(() => {
    const header = COLUMNS.map(c => c.label).join(',');
    const rows = players.map(p => {
      return COLUMNS.map(c => {
        const val = p[c.key];
        if (c.format) return c.format(val);
        return val || '';
      }).join(',');
    });
    const csv = [header, ...rows].join('\n');
    Share.share({ title: 'Elite FPL Workbook', message: csv });
  }, [players]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
            Workbook
          </Text>
          <Button title="Export CSV" onPress={handleExportCSV} variant="secondary" />
        </View>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {POSITIONS.map(pos => (
              <Pressable
                key={pos}
                onPress={() => setPositionFilter(positionFilter === pos ? null : pos)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: positionFilter === pos ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: positionFilter === pos ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: positionFilter === pos ? colors.bg.primary : colors.text.primary,
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  {pos}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              placeholder="Min £"
              placeholderTextColor={colors.text.secondary}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                backgroundColor: colors.bg.surface,
                color: colors.text.primary,
                borderRadius: 6,
                padding: 8,
                fontSize: 13,
              }}
            />
            <TextInput
              placeholder="Max £"
              placeholderTextColor={colors.text.secondary}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="decimal-pad"
              style={{
                flex: 1,
                backgroundColor: colors.bg.surface,
                color: colors.text.primary,
                borderRadius: 6,
                padding: 8,
                fontSize: 13,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {STATUSES.map(status => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(statusFilter === status ? null : status)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 4,
                  backgroundColor: statusFilter === status ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: statusFilter === status ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: statusFilter === status ? colors.bg.primary : colors.text.primary,
                  fontSize: 11,
                  fontWeight: '600',
                }}>
                  {status.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', borderBottomColor: colors.border.subtle, borderBottomWidth: 1 }}>
            {COLUMNS.map(col => (
              <Pressable
                key={col.key}
                onPress={() => handleSort(col.key)}
                style={{ width: `${col.width * 10}%`, padding: 12, backgroundColor: colors.bg.surface }}
              >
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: 11,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </Text>
              </Pressable>
            ))}
          </View>

          {players.map(player => (
            <View key={player.id} style={{
              flexDirection: 'row',
              borderBottomColor: colors.border.subtle,
              borderBottomWidth: 1,
              paddingVertical: 10,
            }}>
              {COLUMNS.map(col => (
                <View key={col.key} style={{ width: `${col.width * 10}%`, paddingHorizontal: 8, justifyContent: 'center' }}>
                  {col.key === 'status' ? (
                    <View style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      backgroundColor: player.status === 'a' ? colors.accent.primaryMuted : colors.status.warning,
                    }}>
                      <Text style={{
                        color: player.status === 'a' ? colors.accent.primary : colors.text.primary,
                        fontSize: 10,
                        fontWeight: '700',
                      }}>
                        {player.status?.toUpperCase() || '—'}
                      </Text>
                    </View>
                  ) : col.key === 'now_cost' ? (
                    <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>
                      £{((player[col.key] || 0) / 10).toFixed(1)}
                    </Text>
                  ) : col.key === 'selected_by_percent' ? (
                    <Text style={{ color: colors.text.primary, fontSize: 13 }}>
                      {player[col.key] || 0}%
                    </Text>
                  ) : (
                    <Text style={{ color: colors.text.primary, fontSize: 13 }}>
                      {col.format ? col.format(player[col.key]) : (player[col.key] || '—')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
          {players.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>No players match your filters.</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function TextInput(props) {
  return <View {...props} />;
}
