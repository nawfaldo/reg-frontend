/**
 * Helper function to check if user has a specific permission
 * @param permissions - Array of permission names the user has
 * @param permissionName - The permission to check for
 * @param isOwner - Whether the user is an owner (owners have all permissions)
 * @returns true if user has the permission, false otherwise
 */
export function hasPermission(
  permissions: string[] | undefined,
  permissionName: string,
  isOwner: boolean = false
): boolean {
  // Owner has all permissions
  if (isOwner) return true;
  
  // Check if user has the required permission
  if (!permissions) return false;
  
  return permissions.includes(permissionName);
}

