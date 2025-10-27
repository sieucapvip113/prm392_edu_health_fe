interface MedicalEventApi {
  OrtherM_ID: number;
  Decription: string;
  Handle: string;
  Image: string | null;
  Is_calLOb: boolean;
  history: {
    ID: number;
    OrtherM_ID: number;
    MR_ID: number;
    Date_create: string;
    Creater_by: string | null;
  }[];
  Medical_record: {
    ID: number;
    userId: number;
    Class: string;
    historyHealth: string;
    height?: number;
    weight?: number;
    bloodType?: string;
    chronicDiseases?: string;
    allergies?: string;
    pastIllnesses?: string;
  };
  UserFullname?: string;
  guardian?: {
    fullname: string;
    phoneNumber: string;
    roleInFamily: string;
    address: string;
    isCallFirst: boolean;
  };
}

interface CreateMedicalEventData {
  ID: string;
  Decription: string;
  Handle: string;
  Image: File | null;
  Video: File | null;
  Is_calLOb: boolean;
}

const API_URL = 'http://localhost:3333/api/v1';

export const medicalEventService = {

  getAllMedicalEvents: async (): Promise<MedicalEventApi[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/other-medical`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.data;
  },

  getMedicalEventById: async (id: string): Promise<MedicalEventApi> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/other-medical/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.data;
  },

  createMedicalEvent: async (formData: CreateMedicalEventData): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    const submitData = new FormData();

    submitData.append('ID', formData.ID);
    submitData.append('Decription', formData.Decription.trim());
    submitData.append('Handle', formData.Handle.trim());
    submitData.append('Is_calLOb', formData.Is_calLOb ? 'true' : 'false');

    if (formData.Image instanceof File) {
      submitData.append('Image', formData.Image);
    }
    if (formData.Video instanceof File) {
      submitData.append('Video', formData.Video);
    }

    console.log('Submitting medical event data:', {
      ID: submitData.get('ID')
    });
    const response = await fetch(`${API_URL}/other-medical`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: submitData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo sự kiện y tế');
    }

    return response.json();
  },

  updateMedicalEvent: async (id: string, formData: CreateMedicalEventData): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    const form = new FormData();
    form.append('MR_ID', formData.ID);
    form.append('Decription', formData.Decription);
    form.append('Handle', formData.Handle);
    form.append('Is_calLOb', String(formData.Is_calLOb));
    if (formData.Image) {
      form.append('Image', formData.Image);
    }

    const response = await fetch(`${API_URL}/other-medical/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: form
    });
    return response.json();
  },


  deleteMedicalEvent: async (id: number): Promise<any> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/other-medical/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.json();
  },

  getMedicalEventsByGuardian: async (guardianId: string): Promise<MedicalEventApi[]> => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/other-medical/guardian/${guardianId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.data;
  },
};
