/**
 * src/screens/workbook/WorkbookScreen.jsx
 *
 * Full sortable player grid (price/form/xPts/ownership/xGI/status/FDR),
 * column-tap sorting, position/price/ownership/status filters, CSV export.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, Share, TextInput } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { usePlayerStore } from '@/state/usePlayerStore';
import { getPlayerPosition } from '@/utils/players';

const COLUMNS = [
  { key: 'web_name', label: 'Name', widthClass: 'w-[12%]' },
  { key: 'position', label: 'Pos', widthClass: 'w-[6%]' },
  { key: 'now_cost', label: 'Price', widthClass: 'w-[8%]', format: v => (Number(v) / 10).toFixed(1) },
  { key: 'form', label: 'Form', widthClass: 'w-[7%]', format: v => v != null ? Number(v).toFixed(1) : '—' },
  { key: 'xG', label: 'xG', widthClass: 'w-[7%]', format: v => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'xA', label: 'xA', widthClass: 'w-[7%]', format: v => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'xGI', label: 'xGI', widthClass: 'w-[8%]', format: v => v != null ? Number(v).toFixed(2) : '—' },
  { key: 'selected_by_percent', label: 'Own%', widthClass: 'w-[8%]', format: v => `${v}%` },
  { key: 'status', label: 'Status', widthClass: 'w-[7%]' },
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
      list = list.filter(p => getPlayerPosition(p) === positionFilter);
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
        const val = c.key === 'position' ? getPlayerPosition(p) : p[c.key];
        if (c.format) return c.format(val);
        return val || '';
      }).join(',');
    });
    const csv = [header, ...rows].join('\n');
    Share.share({ title: 'Elite FPL Workbook', message: csv });
  }, [players]);

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-primary text-2xl font-bold">
            Workbook
          </Text>
          <Button title="Export CSV" onPress={handleExportCSV} variant="secondary" />
        </View>

        <Card className="mb-4">
          <View className="flex-row flex-wrap gap-2 mb-3">
            {POSITIONS.map(pos => (
              <Pressable
                key={pos}
                onPress={() => setPositionFilter(positionFilter === pos ? null : pos)}
                className={`px-3 py-1.5 rounded border ${positionFilter === pos ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-xs font-semibold ${positionFilter === pos ? 'text-secondary' : 'text-text-primary'}`}>
                  {pos}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-row gap-2 mb-3">
            <TextInput
              placeholder="Min £"
              placeholderTextColor={colors.text.secondary}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="decimal-pad"
              className="flex-1 bg-surface text-text-primary rounded p-2 text-[13px]"
            />
            <TextInput
              placeholder="Max £"
              placeholderTextColor={colors.text.secondary}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="decimal-pad"
              className="flex-1 bg-surface text-text-primary rounded p-2 text-[13px]"
            />
          </View>

          <View className="flex-row flex-wrap gap-2">
            {STATUSES.map(status => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(statusFilter === status ? null : status)}
                className={`px-2.5 py-1 rounded border ${statusFilter === status ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-[11px] font-semibold ${statusFilter === status ? 'text-secondary' : 'text-text-primary'}`}>
                  {status.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <View className="flex-row border-b border-border">
            {COLUMNS.map(col => (
              <Pressable
                key={col.key}
                onPress={() => handleSort(col.key)}
                className={`${col.widthClass} p-3 bg-surface`}
              >
                <Text className="text-text-secondary text-[11px] font-semibold uppercase">
                  {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </Text>
              </Pressable>
            ))}
          </View>

          {players.map(player => (
            <View key={player.id} className="flex-row border-b border-border py-2.5">
              {COLUMNS.map(col => (
                <View key={col.key} className={`${col.widthClass} px-2 justify-center`}>
                  {col.key === 'status' ? (
                    <View className={`self-start px-1.5 py-0.5 rounded ${player.status === 'a' ? 'bg-accent-muted' : 'bg-status-warning'}`}>
                      <Text className={`text-[10px] font-bold ${player.status === 'a' ? 'text-primary' : 'text-text-primary'}`}>
                        {player.status?.toUpperCase() || '—'}
                      </Text>
                    </View>
                  ) : col.key === 'now_cost' ? (
                    <Text className="text-text-primary text-[13px] font-semibold">
                      £{(Number(player[col.key] || 0) / 10).toFixed(1)}
                    </Text>
                  ) : col.key === 'selected_by_percent' ? (
                    <Text className="text-text-primary text-[13px]">
                      {player[col.key] || 0}%
                    </Text>
                  ) : col.key === 'position' ? (
                    <Text className="text-text-primary text-[13px]">
                      {getPlayerPosition(player)}
                    </Text>
                  ) : (
                    <Text className="text-text-primary text-[13px]">
                      {col.format ? col.format(player[col.key]) : (player[col.key] || '—')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
          {players.length === 0 && (
            <View className="p-6 items-center">
              <Text className="text-text-secondary text-sm">No players match your filters.</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
