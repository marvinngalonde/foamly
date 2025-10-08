import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'inactive';
  joinedDate?: Date;
}

export default function ProviderTeamScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('team_member');

  const { data: provider, isLoading } = useProviderByUserId(user?.id || '');

  // TODO: This would be fetched from a team_members table in the database
  // For now, showing the structure for when the feature is implemented
  const teamMembers: TeamMember[] = [];

  const handleInviteMember = () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // TODO: Implement team invitation API
    Alert.alert(
      'Coming Soon',
      'Team management functionality will be available in a future update. This will allow you to invite team members, assign roles, and manage permissions.'
    );

    setInviteEmail('');
    setShowInviteForm(false);
  };

  const handleRemoveMember = (memberId: string) => {
    Alert.alert(
      'Remove Team Member',
      'Are you sure you want to remove this team member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement remove team member API
            Alert.alert('Success', 'Team member removed');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/provider-dashboard')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team</Text>
        <TouchableOpacity
          onPress={() => setShowInviteForm(!showInviteForm)}
          style={styles.addButton}
        >
          <MaterialCommunityIcons
            name={showInviteForm ? 'close' : 'account-plus'}
            size={24}
            color="#3B82F6"
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView style={styles.scrollContent}>
          {/* Invite Form */}
          {showInviteForm && (
            <View style={styles.inviteForm}>
              <Text style={styles.inviteTitle}>Invite Team Member</Text>

              <TextInput
                label="Email Address"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
              />

              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>Role</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      inviteRole === 'team_member' && styles.roleOptionActive,
                    ]}
                    onPress={() => setInviteRole('team_member')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        inviteRole === 'team_member' && styles.roleOptionTextActive,
                      ]}
                    >
                      Team Member
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      inviteRole === 'manager' && styles.roleOptionActive,
                    ]}
                    onPress={() => setInviteRole('manager')}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        inviteRole === 'manager' && styles.roleOptionTextActive,
                      ]}
                    >
                      Manager
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                mode="contained"
                buttonColor="#3B82F6"
                onPress={handleInviteMember}
                style={styles.inviteButton}
              >
                Send Invitation
              </Button>
            </View>
          )}

          {/* Team Info Card */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="account-group" size={48} color="#3B82F6" />
            <Text style={styles.infoTitle}>Team Management</Text>
            <Text style={styles.infoText}>
              Build your team by inviting members to help manage bookings, communicate with
              customers, and grow your business.
            </Text>
          </View>

          {/* Owner Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
              </View>

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.memberEmail}>{user?.email}</Text>
                <View style={styles.memberBadge}>
                  <Text style={styles.memberBadgeText}>Owner</Text>
                </View>
              </View>

              <MaterialCommunityIcons name="crown" size={24} color="#F59E0B" />
            </View>
          </View>

          {/* Team Members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members ({teamMembers.length})</Text>

            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
                  </View>

                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <View
                      style={[
                        styles.memberBadge,
                        member.status === 'invited' && styles.memberBadgeInvited,
                        member.status === 'inactive' && styles.memberBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.memberBadgeText,
                          member.status === 'invited' && styles.memberBadgeTextInvited,
                          member.status === 'inactive' && styles.memberBadgeTextInactive,
                        ]}
                      >
                        {member.status === 'invited' ? 'Invited' : member.role}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => handleRemoveMember(member.id)}>
                    <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-group-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No team members yet</Text>
                <Text style={styles.emptySubtext}>
                  Invite team members to help manage your business
                </Text>
                <Button
                  mode="contained"
                  buttonColor="#3B82F6"
                  onPress={() => setShowInviteForm(true)}
                  style={styles.emptyButton}
                >
                  Invite Team Member
                </Button>
              </View>
            )}
          </View>

          {/* Permissions Info */}
          <View style={styles.permissionsCard}>
            <Text style={styles.permissionsTitle}>Role Permissions</Text>

            <View style={styles.permissionItem}>
              <MaterialCommunityIcons name="shield-account" size={20} color="#3B82F6" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionRole}>Team Member</Text>
                <Text style={styles.permissionDescription}>
                  View bookings, update status, communicate with customers
                </Text>
              </View>
            </View>

            <View style={styles.permissionItem}>
              <MaterialCommunityIcons name="shield-star" size={20} color="#8B5CF6" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionRole}>Manager</Text>
                <Text style={styles.permissionDescription}>
                  All team member permissions plus manage services, pricing, and team
                </Text>
              </View>
            </View>

            <View style={styles.permissionItem}>
              <MaterialCommunityIcons name="shield-crown" size={20} color="#F59E0B" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionRole}>Owner</Text>
                <Text style={styles.permissionDescription}>
                  Full access to all features and settings
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  inviteForm: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  roleSelector: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  roleOptionTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  inviteButton: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberBadgeInvited: {
    backgroundColor: '#FEF3C7',
  },
  memberBadgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  memberBadgeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  memberBadgeTextInvited: {
    color: '#F59E0B',
  },
  memberBadgeTextInactive: {
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#CCC',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyButton: {
    marginTop: 20,
  },
  permissionsCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 1,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
  },
  permissionRole: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'NunitoSans_400Regular',
  },
});
