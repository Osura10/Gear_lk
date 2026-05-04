import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, Platform, Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import apiService from '../../../utils/apiService';
import { COLORS } from '../../../theme/colors';

const DISCOUNT_TYPES = ['percentage', 'fixed'];

const defaultForm = {
  code: '',
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: '',
  usageLimit: '',
  perUserLimit: '1',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  isActive: true,
};

// ─── Voucher Form Modal ────────────────────────────────────────────────────────
const VoucherFormModal = ({ visible, onClose, onSave, initial }) => {
  const [form, setForm] = useState(initial || defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initial || defaultForm);
  }, [initial, visible]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.code || !form.title || !form.discountValue || !form.endDate) {
      Alert.alert('Validation', 'Code, title, discount value and expiry date are required.');
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{initial ? 'Edit Voucher' : 'Create Voucher'}</Text>

            <Field label="Voucher Code *" value={form.code} onChangeText={(v) => set('code', v.toUpperCase())} placeholder="e.g. SAVE20" autoCapitalize="characters" />
            <Field label="Title *" value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. 20% Off All Gear" />
            <Field label="Description" value={form.description} onChangeText={(v) => set('description', v)} placeholder="Optional details" multiline />

            <Text style={styles.fieldLabel}>Discount Type *</Text>
            <View style={styles.segmentRow}>
              {DISCOUNT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.segmentBtn, form.discountType === t && styles.segmentBtnActive]}
                  onPress={() => set('discountType', t)}
                >
                  <Text style={[styles.segmentText, form.discountType === t && styles.segmentTextActive]}>
                    {t === 'percentage' ? '% Percentage' : 'Fixed (Rs.)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label={`Discount Value * (${form.discountType === 'percentage' ? '%' : 'Rs.'})`}
              value={form.discountValue}
              onChangeText={(v) => set('discountValue', v)}
              placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
              keyboardType="numeric"
            />
            {form.discountType === 'percentage' && (
              <Field label="Max Discount Cap (Rs.)" value={form.maxDiscountAmount} onChangeText={(v) => set('maxDiscountAmount', v)} placeholder="e.g. 2000 (optional)" keyboardType="numeric" />
            )}
            <Field label="Min Order Amount (Rs.)" value={form.minOrderAmount} onChangeText={(v) => set('minOrderAmount', v)} placeholder="e.g. 1000 (0 = no min)" keyboardType="numeric" />
            <Field label="Usage Limit (Total)" value={form.usageLimit} onChangeText={(v) => set('usageLimit', v)} placeholder="Leave blank for unlimited" keyboardType="numeric" />
            <Field label="Per-User Limit" value={form.perUserLimit} onChangeText={(v) => set('perUserLimit', v)} placeholder="1" keyboardType="numeric" />
            <Field label="Start Date (YYYY-MM-DD) *" value={form.startDate} onChangeText={(v) => set('startDate', v)} placeholder="2026-05-01" />
            <Field label="Expiry Date (YYYY-MM-DD) *" value={form.endDate} onChangeText={(v) => set('endDate', v)} placeholder="2026-12-31" />

            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Active</Text>
              <Switch
                value={form.isActive}
                onValueChange={(v) => set('isActive', v)}
                trackColor={{ false: COLORS.gray, true: COLORS.secondary }}
                thumbColor={COLORS.primary}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.primary} />
                : <Text style={styles.saveBtnText}>{initial ? 'Update Voucher' : 'Create Voucher'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Field Helper ─────────────────────────────────────────────────────────────
const Field = ({ label, ...props }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput style={[styles.fieldInput, props.multiline && { height: 80, textAlignVertical: 'top' }]} placeholderTextColor={COLORS.gray} {...props} />
  </View>
);

// ─── Voucher Card ─────────────────────────────────────────────────────────────
const VoucherCard = ({ voucher, onEdit, onDelete, onToggle }) => {
  const isExpired = new Date(voucher.endDate) < new Date();
  const statusColor = !voucher.isActive ? COLORS.gray : isExpired ? COLORS.error : COLORS.success;
  const statusLabel = !voucher.isActive ? 'Inactive' : isExpired ? 'Expired' : 'Active';

  return (
    <View style={styles.voucherCard}>
      <View style={styles.vcTop}>
        <View style={styles.vcLeft}>
          <Text style={styles.vcCode}>{voucher.code}</Text>
          <Text style={styles.vcTitle}>{voucher.title}</Text>
        </View>
        <View style={[styles.vcBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.vcBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.vcStats}>
        <StatChip icon="💰" label={voucher.discountType === 'percentage' ? `${voucher.discountValue}% off` : `Rs. ${voucher.discountValue} off`} />
        <StatChip icon="📦" label={`Min Rs. ${voucher.minOrderAmount || 0}`} />
        <StatChip icon="👤" label={`${voucher.usageCount}/${voucher.usageLimit ?? '∞'} used`} />
      </View>

      <Text style={styles.vcExpiry}>
        Expires: {new Date(voucher.endDate).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' })}
      </Text>

      <View style={styles.vcActions}>
        <TouchableOpacity style={styles.vcEditBtn} onPress={() => onEdit(voucher)}>
          <Text style={styles.vcEditText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vcToggleBtn} onPress={() => onToggle(voucher)}>
          <Text style={styles.vcToggleText}>{voucher.isActive ? '⏸ Deactivate' : '▶ Activate'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vcDeleteBtn} onPress={() => onDelete(voucher._id)}>
          <Text style={styles.vcDeleteText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StatChip = ({ icon, label }) => (
  <View style={styles.statChip}>
    <Text style={styles.statChipText}>{icon} {label}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const VoucherManagement = ({ navigation }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetch = async () => {
    try {
      const res = await apiService.getVouchers();
      setVouchers(res.data.data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (form) => {
    await apiService.createVoucher({
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: Number(form.perUserLimit) || 1,
    });
    fetch();
  };

  const handleUpdate = async (form) => {
    await apiService.updateVoucher(editTarget._id, {
      ...form,
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: Number(form.perUserLimit) || 1,
    });
    setEditTarget(null);
    fetch();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Voucher', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await apiService.deleteVoucher(id);
            fetch();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      },
    ]);
  };

  const handleToggle = async (voucher) => {
    try {
      await apiService.updateVoucher(voucher._id, { isActive: !voucher.isActive });
      fetch();
    } catch (e) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  const openEdit = (voucher) => {
    setEditTarget(voucher);
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditTarget(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditTarget(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voucher Management</Text>
        <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={COLORS.secondary} />
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(v) => v._id}
          renderItem={({ item }) => (
            <VoucherCard
              voucher={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎟</Text>
              <Text style={styles.emptyTitle}>No Vouchers Yet</Text>
              <Text style={styles.emptySub}>Create your first promo code to attract buyers!</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
                <Text style={styles.emptyBtnText}>Create Voucher</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <VoucherFormModal
        visible={modalVisible}
        onClose={closeModal}
        onSave={editTarget ? handleUpdate : handleCreate}
        initial={editTarget ? {
          code: editTarget.code,
          title: editTarget.title,
          description: editTarget.description || '',
          discountType: editTarget.discountType,
          discountValue: String(editTarget.discountValue),
          maxDiscountAmount: editTarget.maxDiscountAmount ? String(editTarget.maxDiscountAmount) : '',
          minOrderAmount: String(editTarget.minOrderAmount || ''),
          usageLimit: editTarget.usageLimit ? String(editTarget.usageLimit) : '',
          perUserLimit: String(editTarget.perUserLimit || 1),
          startDate: editTarget.startDate?.split('T')[0] || '',
          endDate: editTarget.endDate?.split('T')[0] || '',
          isActive: editTarget.isActive,
        } : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 55 : 20, paddingBottom: 15,
    backgroundColor: COLORS.primary,
  },
  backBtn: { padding: 6, marginRight: 8 },
  backBtnText: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: COLORS.secondary },
  createBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },

  listContent: { padding: 16 },

  // Voucher Card
  voucherCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 18, marginBottom: 14,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  vcTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  vcLeft: { flex: 1 },
  vcCode: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, letterSpacing: 2, marginBottom: 2 },
  vcTitle: { fontSize: 13, color: COLORS.textSecondary },
  vcBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  vcBadgeText: { fontSize: 12, fontWeight: 'bold' },
  vcStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  statChip: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  vcExpiry: { fontSize: 12, color: COLORS.gray, marginBottom: 14 },
  vcActions: { flexDirection: 'row', gap: 8 },
  vcEditBtn: { flex: 1, backgroundColor: COLORS.background, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  vcEditText: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
  vcToggleBtn: { flex: 1.4, backgroundColor: COLORS.primary + '15', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  vcToggleText: { fontSize: 12, fontWeight: 'bold', color: COLORS.primary },
  vcDeleteBtn: { width: 44, height: 44, backgroundColor: '#FEE2E2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vcDeleteText: { fontSize: 18 },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 80, padding: 30 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.gray, textAlign: 'center', lineHeight: 20, marginBottom: 25 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 20 },
  emptyBtnText: { color: COLORS.secondary, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    maxHeight: '92%', padding: 20, paddingTop: 12,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginBottom: 6 },
  fieldInput: {
    height: 46, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 15, color: COLORS.primary, backgroundColor: COLORS.background,
  },
  segmentRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  segmentBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background,
  },
  segmentBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  segmentTextActive: { color: COLORS.secondary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  saveBtn: {
    backgroundColor: COLORS.secondary, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginBottom: 10,
  },
  saveBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: COLORS.gray, fontWeight: '600' },
});

export default VoucherManagement;
