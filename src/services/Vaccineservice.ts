const API_URL = 'http://localhost:3333/api/v1';

export interface VaccinePayload {
  VH_ID: number;
  Event_ID: number;
  MR_ID: number;
  Vaccine_name: string;
  Vaccince_type: string;
  Date_injection: string;
  note_affter_injection: string | null;
  image_after_injection?: string | null;
  Status: string;
  MedicalRecord: {
    ID: number;
    userId: number;
    Class: string;
    height: number | null;
    weight: number | null;
    bloodType: string | null;
    vaccines: any;
    chronicDiseases: any;
    allergies: any;
    pastIllnesses: any;
  };
  PatientName: string;
}

export interface GuardianVaccineHistory {

  medicalRecord: {
    ID: number;
    userId: number;
    Class: string;
    height: number | null;
    weight: number | null;
    bloodType: string | null;
    vaccines: any;
    chronicDiseases: any;
    allergies: any;
    pastIllnesses: any;
  };
  user: {
    id: number;
    fullname: string;
    dateOfBirth: Date;
  };
  vaccineHistory: {
    VH_ID: number;
    Event_ID: number;
    MR_ID: number;
    Vaccine_name: string;
    Vaccince_type: string;
    Date_injection: string;
    note_affter_injection: string | null;
    image_after_injection?: string | null;
    Status: string;
    batch_number: string;
  }[];
}

export interface GuardianVaccineResponse {
  totalVaccine: number;
  totalNeedConfirm: number;
  histories: GuardianVaccineHistory[];
}

export interface VaccineTypeResponse {
  id: number;
  name: string;
}

export interface VaccineCreateRequest {
  Vaccine_name: string;
  Vaccince_type: string;
  Date_injection: string;
  batch_number: string;
  Grade: string;
}
export interface VaccineCreateEvidenceRequest {
  ID: string;
  Vaccine_name: string;
  Vaccince_type: string;
  Date_injection: string;
  note_affter_injection: string;
  evidence: File | File[] | string | string[];
}

export interface VaccineUpdateItem {
  VH_ID: number;
  status: string;
  note_affter_injection: string;
  image?: File | null;
}

export interface UpdateVaccineStatusRequest {
  updates: VaccineUpdateItem[];
}

export interface VaccineEvent {
  vaccineName: string;
  vaccineType: string;
  grade: number;
  eventdate: string;
  batch_number: string;
}

export interface VaccineHistoryByMedicalRecordResponse {
  patientName: string;
  medicalRecord: {
    ID: number;
    userId: number;
    Class: string;
    height: number;
    weight: number;
    bloodType: string;
    chronicDiseases: string;
    allergies: string;
    pastIllnesses: string;
    createdAt: string;
    updatedAt: string;
  };
  vaccineHistory: {
    VH_ID: number;
    Event_ID: number;
    ID: number;
    Vaccine_name: string;
    Vaccince_type: string;
    Date_injection: string;
    note_affter_injection: string | null;
    Status: string;
    Is_created_by_guardian: boolean;
  }[];
}

const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return {
      id: payload.userId || payload.id || payload.sub
    };
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const vaccineService = {
  postVaccine: async (payload: VaccinePayload): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/vaccine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Failed to post vaccine data');
    }
    return response.json();
  },

  getAllVaccines: async (): Promise<VaccinePayload[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/vaccine`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine data');
    }
    const result = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  },

  getVaccineTypes: async (): Promise<string[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/vaccine/types`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine types');
    }
    const data = await response.json();
    return data.data;
  },

  getVaccineByName: async (vaccineName: string, grade?: string, eventDate?: string): Promise<VaccinePayload[]> => {
    const token = localStorage.getItem('accessToken');
    let query = '';
    if (grade || eventDate) {
      const params = [];
      if (grade) params.push(`grade=${encodeURIComponent(grade)}`);
      if (eventDate) params.push(`eventDate=${encodeURIComponent(eventDate)}`);
      query = '?' + params.join('&');
    }
    const url = `${API_URL}/vaccine/by-name/${encodeURIComponent(vaccineName)}${query}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine histories by name');
    }
    const result = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  },

  getVaccinesByGuardian: async (): Promise<GuardianVaccineResponse> => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    const decodedToken = decodeToken(token);
    if (!decodedToken?.id) {
      console.error('Token payload:', decodedToken);
      throw new Error('Could not extract user ID from token');
    }

    const response = await fetch(`${API_URL}/vaccine/guardian/${decodedToken.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch guardian vaccine histories');
    }
    const result = await response.json();
    return result.data;
  },

  confirmVaccine: async (id: string, isConfirmed: boolean) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    try {
      const response = await fetch(`${API_URL}/vaccine/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          isConfirmed,
          vh_id: parseInt(id)
        })
      });

      if (response.ok) {
        return { success: true };
      }
      const errorData = await response.json();
      if (errorData.message !== 'Validation error') {
        throw new Error(errorData.message || 'Failed to confirm vaccine status');
      }

      return { success: true };
    } catch (error) {
      console.error('Confirm vaccine error:', error);
      throw error;
    }
  },

  getAllVaccinesForChild: async (): Promise<VaccineTypeResponse[]> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    try {
      const response = await fetch(`${API_URL}/vaccine`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vaccines');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      throw error;
    }
  },

  createVaccine: async (vaccineData: VaccineCreateRequest): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    try {
      const response = await fetch(`${API_URL}/vaccine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(vaccineData)
      });

      const result = await response.json();
      if (!response.ok) {
        const msg = result?.message || (result?.error && result.error.message) || 'Failed to create vaccine';
        throw new Error(msg);
      }

      return result;
    } catch (error) {
      console.error('Error creating vaccine:', error);
      throw error;
    }
  },

  updateVaccineStatus: async (data: UpdateVaccineStatusRequest): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    try {
      const formData = new FormData();
      const updatesForJson = data.updates.map(update => {
        const { image, ...rest } = update;
        if (image instanceof File) {
          return rest;
        }
        return update;
      });
      formData.append('updates', JSON.stringify(updatesForJson));
      
      data.updates.forEach(update => {
        if (update.image instanceof File) {
          formData.append(`image_${update.VH_ID}`, update.image);
        }
      });

      const response = await fetch(`${API_URL}/vaccine/vaccine-history/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();
      console.log('Service - Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update vaccine status');
      }

      return responseData;
    } catch (error) {
      console.error('Service - Error Details:', error);
      throw error;
    }
  },

  getVaccineEvents: async (): Promise<VaccineEvent[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/vaccine/types`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine events');
    }
    const data = await response.json();
    return data.data;
  },

  getVaccineHistoryByMedicalRecordId: async (medicalRecordId: number): Promise<VaccineHistoryByMedicalRecordResponse> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');
    const response = await fetch(`${API_URL}/vaccine/medical-record/${medicalRecordId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccine history by medical record ID');
    }
    const result = await response.json();
    return result;
  },

  deleteVaccineByNameDateGrade: async (params: { vaccineName: string; dateInjection: string }): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');
    const response = await fetch(`${API_URL}/vaccine/delete-by-name-date-grade`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.message || 'Failed to delete vaccine event');
    }
    return {
      message: result?.message,
      data: {
        deletedCount: result?.data?.deletedCount ?? 0
      }
    };
  },
  createVaccineEvidence: async (formData: FormData): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');

    try {
      const response = await fetch(`${API_URL}/vaccine/evidence`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        const msg = result?.message || (result?.error && result.error.message) || 'Failed to create vaccine';
        throw new Error(msg);
      }

      return result;
    } catch (error) {
      console.error('Error creating vaccine:', error);
      throw error;
    }
  },


};

