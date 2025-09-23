import api from "@/api/axios/axios";
import authService from "@/service/authService";

const getMyProfile = async () => {
    const loggedInUser = authService.getUser();

    if (!loggedInUser || !loggedInUser.id) {
        throw new Error('Nao foi possivel obter o id do usuario logado');
    }

    try {
        const response =  await api.get(`/users/${loggedInUser.id}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter o usuario logado', error);
        throw error
    }
    
}
  

export default getMyProfile