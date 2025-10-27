export interface HealthCheckEvent {
  HC_ID: number;
  Event_ID: number;
  School_year: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  Event: {
    eventId: number;
    dateEvent: string;
    type: string;
  };
  status?: string;
}

export interface CreateHealthCheckRequest {
  title: string;
  description: string;
  dateEvent: string;
  schoolYear: string;
  type: string;
}

export interface CreateHealthCheckResponse {
  success: boolean;
  data: {
    eventId: number;
    dateEvent: string;
    type: string;
    title: string;
    description: string;
    schoolYear: string;
  };
}

export interface SendConfirmationResponse {
  success: boolean;
  message: string;
}

export interface GuardianUser {
  id: number;
  obId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Guardian {
  obId: number;
  phoneNumber: string;
  roleInFamily: string;
  isCallFirst: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  GuardianUser: GuardianUser;
}

export interface Student {
  id: number;
  username: string;
  fullname: string;
  password: string;
  email: string;
  phoneNumber: string | null;
  roleId: number;
  createdAt: string;
  updatedAt: string;
  Guardians: Guardian[];
}

export interface HealthCheckForm {
  Form_ID: number;
  HC_ID: number;
  Student_ID: number;
  Height: number | null;
  Weight: number | null;
  Blood_Pressure: string | null;
  Vision_Left: number | null;
  Vision_Right: number | null;
  Dental_Status: string | null;
  ENT_Status: string | null;
  Skin_Status: string | null;
  General_Conclusion: string | null;
  Is_need_meet: boolean;
  Is_confirmed_by_guardian: boolean;
  createdAt: string;
  updatedAt: string;
  GuardianUserId: number | null;
  Student: Student;
  status?: string;
  image?: string;
}

export interface GetStudentsByHealthCheckResponse {
  success: boolean;
  data: HealthCheckForm[];
}

export interface HealthCheckFormByStudent {
  formId: number;
  studentId: number;
  status: string;
  healthCheckId: number;
  title: string;
  description: string;
  schoolYear: string;
  eventId: number;
  dateEvent: string;
  type: string;
}

export interface GetHealthCheckFormsByStudentResponse {
  success: boolean;
  data: HealthCheckFormByStudent[];
}

export interface SubmitHealthCheckResultRequest {
  student_id: number;
  height: number;
  weight: number;
  blood_pressure: string;
  vision_left: number;
  vision_right: number;
  dental_status: string;
  ent_status: string;
  skin_status: string;
  general_conclusion: string;
  is_need_meet: boolean;
  image?: File;
}

export interface HealthCheckResult {
  Form_ID: number;
  HC_ID: number;
  Student_ID: number;
  Height: number;
  Weight: number;
  Blood_Pressure: string;
  Vision_Left: number;
  Vision_Right: number;
  Dental_Status: string;
  ENT_Status: string;
  Skin_Status: string;
  General_Conclusion: string;
  Is_need_meet: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  GuardianUserId: number | null;
  image?: string;
}

const API_URL = 'http://localhost:3333/api/v1';

export const healthCheckService = {
  // Get all health check events
  getAllHealthChecks: async (): Promise<HealthCheckEvent[]> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Access token is missing");
    }

    const response = await fetch(`${API_URL}/health-check`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  },

  // Create a new health check event
  createHealthCheck: async (data: CreateHealthCheckRequest): Promise<CreateHealthCheckResponse> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Access token is missing");
    }

    const response = await fetch(`${API_URL}/health-check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Send confirmation form to parents
  sendConfirmationForm: async (id: number): Promise<SendConfirmationResponse> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Access token is missing");
    }

    const response = await fetch(`${API_URL}/health-check/${id}/send-confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Get students by health check ID
  getStudentsByHealthCheck: async (hcId: number): Promise<GetStudentsByHealthCheckResponse> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("Access token is missing");
    }

    const response = await fetch(`${API_URL}/health-check/${hcId}/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Update a health check event
  updateHealthCheck: async (hcId: number, data: Partial<CreateHealthCheckRequest>): Promise<CreateHealthCheckResponse> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Access token is missing");
    }
    const response = await fetch(`${API_URL}/health-check?id=${hcId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Delete a health check event
  deleteHealthCheck: async (hcId: number): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Access token is missing");
    }
    const response = await fetch(`${API_URL}/health-check?id=${hcId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get detail of a health check event by ID
  getHealthCheckById: async (hcId: number): Promise<CreateHealthCheckResponse> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Access token is missing");
    }
    const response = await fetch(`${API_URL}/health-check/${hcId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Guardian confirm or reject health check form
  confirmHealthCheckForm: async (formId: number, action: 'approve' | 'reject'): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Access token is missing");
    }
    const response = await fetch(`${API_URL}/health-check/form/${formId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      body: JSON.stringify({ action }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getHealthCheckFormsByStudent: async (studentId: number): Promise<GetHealthCheckFormsByStudentResponse> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Access token is missing');
    const response = await fetch(`${API_URL}/health-check/student/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  submitHealthCheckResult: async (
    hcId: number,
    data: SubmitHealthCheckResultRequest
  ): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Access token is missing');

    const formData = new FormData();
    formData.append('student_id', String(data.student_id));
    formData.append('height', String(data.height));
    formData.append('weight', String(data.weight));
    formData.append('blood_pressure', data.blood_pressure);
    formData.append('vision_left', String(data.vision_left));
    formData.append('vision_right', String(data.vision_right));
    formData.append('dental_status', data.dental_status);
    formData.append('ent_status', data.ent_status);
    formData.append('skin_status', data.skin_status);
    formData.append('general_conclusion', data.general_conclusion);
    formData.append('is_need_meet', String(data.is_need_meet));

    // ⚠️ Nếu có ảnh thì phải là File (ví dụ: data.image = values.image[0].originFileObj)
    if (data.image) {
      formData.append('image', data.image as any); // hoặc ép kiểu File nếu chắc chắn
    }

    const response = await fetch(`${API_URL}/health-check/${hcId}/submit-result`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Không set Content-Type khi dùng FormData, trình duyệt sẽ tự set
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },


  // Send health check result to guardians
  sendHealthCheckResult: async (hcId: number): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Access token is missing');
    const response = await fetch(`${API_URL}/health-check/${hcId}/send-result`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Get health check result for a specific student
  getHealthCheckResult: async (hcId: number, studentId: number): Promise<HealthCheckResult> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Access token is missing');
    const response = await fetch(`${API_URL}/health-check/${hcId}/form-result?student_id=${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Update health check result
  updateHealthCheckResult: async (
    hcId: number,
    studentId: number,
    data: SubmitHealthCheckResultRequest
  ): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Access token is missing');

    const formData = new FormData();
    formData.append('student_id', String(data.student_id));
    formData.append('height', String(data.height));
    formData.append('weight', String(data.weight));
    formData.append('blood_pressure', data.blood_pressure);
    formData.append('vision_left', String(data.vision_left));
    formData.append('vision_right', String(data.vision_right));
    formData.append('dental_status', data.dental_status);
    formData.append('ent_status', data.ent_status);
    formData.append('skin_status', data.skin_status);
    formData.append('general_conclusion', data.general_conclusion);
    formData.append('is_need_meet', String(data.is_need_meet));
    // Nếu có ảnh thì thêm vào formData
    if (data.image) {
      formData.append('image', data.image as any); // hoặc ép kiểu File nếu chắc chắn
    }

    const response = await fetch(`${API_URL}/health-check/${hcId}/form-result?student_id=${studentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // ❌ Không set 'Content-Type' khi dùng FormData
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

};

export const getHealthCheckFormsByStudent = async (studentId: number): Promise<GetHealthCheckFormsByStudentResponse> => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Access token is missing');
  const response = await fetch(`${API_URL}/health-check/student/${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
