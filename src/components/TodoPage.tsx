import { Check, Delete } from '@mui/icons-material';
import { Box, Button, Container, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch.ts';
import { Task } from '../index';

const TodoPage = () => {
  const api = useFetch();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editedTasks, setEditedTasks] = useState<{ [key: number]: string }>({}); // Pour stocker les modifications des tâches
  const [newTask, setNewTask] = useState<string>(''); // Pour stocker la nouvelle tâche

  const handleFetchTasks = async () => {
    try {
      const fetchedTasks = await api.get('/tasks');
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      await handleFetchTasks();
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche', error);
    }
  };

  const handleSave = async () => {
    if (newTask.trim() === '') return; // Empêche l'ajout de tâches vides
    try {
      await api.post('/tasks', { name: newTask });
      setNewTask(''); // Réinitialise le champ de saisie de la nouvelle tâche
      await handleFetchTasks();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la tâche', error);
    }
  };

  const handleUpdate = async (id: number) => {
    const updatedTaskName = editedTasks[id]; // Nom de la tâche modifié
    if (updatedTaskName && updatedTaskName !== tasks.find((task) => task.id === id)?.name) {
      if (Object.keys(editedTasks).length > 0) { // 👈 Add this check
        try {
          await api.put(`/tasks/${id}`, { name: updatedTaskName });
          delete editedTasks[id]; // 👈 Add this line to remove the edited task from the state
          await handleFetchTasks();
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la tâche', error);
        }
      }
    }
  };

  const handleEditTask = (id: number, newValue: string) => {
    setEditedTasks((prev) => ({ ...prev, [id]: newValue }));
  };

  useEffect(() => {
    handleFetchTasks();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h2">HDM Todo List</Typography>
      </Box>

      <Box justifyContent="center" mt={5} flexDirection="column">
        {
          tasks.map((task) => (
            <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={1} width="100%" key={task.id}>
              <TextField
                size="small"
                value={editedTasks[task.id] !== undefined ? editedTasks[task.id] : task.name}
                onChange={(e) => handleEditTask(task.id, e.target.value)}
                fullWidth
                sx={{ maxWidth: 350 }}
              />
              <Box>
                <IconButton
                  color="success"
                  onClick={() => handleUpdate(task.id)} // Met à jour la tâche
                  disabled={editedTasks[task.id] === task.name || !editedTasks[task.id]} // Désactive si aucune modification
                >
                  <Check />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(task.id)}>
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          ))
        }

        <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={1}>
          <TextField
            size="small"
            placeholder="Nouvelle tâche"
            value={newTask} // Utilise l'état pour la nouvelle tâche
            onChange={(e) => setNewTask(e.target.value)} // Met à jour l'état de la nouvelle tâche
            fullWidth
            sx={{ maxWidth: 350 }}
          />
          <Button
            variant="outlined"
            onClick={handleSave} // Appelle la fonction pour sauvegarder la nouvelle tâche
          >
            Ajouter une tâche
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TodoPage;
