import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import { parseISO, formatRelative } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Icon from 'react-native-vector-icons/MaterialIcons';

import { Container,
  Form,
  TitleInput,
  SubmitButton,
  RepoList,
  Repo,
  RepoName,
  RepoAvatar,
  Language,
  Updated
  } from './styles';

import Background from '../../components/Background';

import api from '../../services/api';

export default function Repository() {
  const [newRepo, setNewRepo] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getRepos(){
      const repos = await AsyncStorage.getItem('repos', repos);
      if(repos){
        setRepos(JSON.parse(repos));
      }
    }
    getRepos();
  }, []);

  useEffect(() => {
    async function updateRepos(){
      await AsyncStorage.setItem('repos', JSON.stringify(repos));
    }
    updateRepos();
  }, [repos]);

  async function handleSubmit(){
    try {

      setLoading(true);
      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        id: response.data.id,
        name: response.data.name,
        avatar_url: response.data.owner.avatar_url,
        html_url: response.data.html_url,
        updated_at: formatRelative(parseISO(response.data.updated_at), new Date(), {
          locale: pt,
        }) ,
        language: response.data.language
      }

      const repoExists = repos.find(repo => repo.id === data.id);

      if(repoExists) {
        Alert.alert('Erro', 'Você já adicionou esse repositório a lista!');
        setNewRepo('');
        setLoading(false);
        return;
      }

      setRepos(repos => [...repos, data]);
      setNewRepo('');
      setLoading(false);

      console.log(response.data);
    } catch(err) {
      Alert.alert('Ops', 'Ocorreu algum erro, tente verificar se o nome da companhia ou do repositório estão corretos')
      setLoading(false);
    }
  }

  function handleNavigate(blog) {

  }

  return (
    <Background>
      <Container>
        <Form>
            <TitleInput 
              placeholder="company/repo"
              autoCapitalize="none"
              value={newRepo}
              onChangeText={setNewRepo}
            />
            <SubmitButton onPress={handleSubmit}>
              {loading ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <Icon name="add" size={20} color="#fff" />
              )}
            </SubmitButton>
          </Form>

      <RepoList 
        data={repos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Repo onPress={() => handleNavigate(item.html_url)}>
            <RepoAvatar source={{ uri: item.avatar_url}} />
            <RepoName>{item.name}</RepoName>
            <Language>{item.language}</Language>
            <Updated>Atualizado {item.updated_at}</Updated>
          </Repo>
        )}
      />

      </Container>

    </Background>
  );
}


// id: response.data.id,
// name: response.data.name,
// avatar_url: response.data.owner.avatar_url,
// html_url: response.data.html_url,
// updated_at: response.data.updated_at,
// language: response.data.language