export const buildOrgBranchFilter = (auth) => {
  const orgId = auth?.organizationId;
  const branchId = auth?.branchId;

  const filter = {};
  if (!orgId || orgId === 'default') {
    filter.organizationId = { $in: ['default', null, undefined, ''] };
  } else {
    filter.organizationId = orgId;
  }

  if (!branchId || branchId === 'main' || branchId === 'default') {
    filter.branchId = { $in: ['main', 'default', null, undefined, ''] };
  } else {
    filter.branchId = branchId;
  }

  return filter;
};

export default buildOrgBranchFilter;
