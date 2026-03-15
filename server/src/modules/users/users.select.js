export const safeUserSelect = {
  id: true,
  fullName: true,
  email: true,
  profileImageUrl: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

export const safePatientInclude = {
  user: {
    select: safeUserSelect
  }
};

export const safeDoctorInclude = {
  user: {
    select: safeUserSelect
  }
};
