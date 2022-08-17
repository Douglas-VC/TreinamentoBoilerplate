import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import AssignmentSharpIcon from '@mui/icons-material/AssignmentSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import EditSharpIcon from '@mui/icons-material/EditSharp';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { isMobile } from '/imports/libs/deviceVerify';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import { CardActionArea } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export const Task = ({ task, onDeleteClick, onEditClick, onTaskClick, onChangeStatus }) => {
    const isSmall = useMediaQuery('(max-width:600px)');
    return (
        <ListItem
            sx={{
                border: 2,
                borderRadius: "6px",
                mb: "5px",
                borderColor: '#59a8f7',
                padding: '5px'
            }}>

            <IconButton
                size="large"
                onClick={() => onChangeStatus(task._id, task.status === 'Não Concluída' ? 'Concluída' : 'Não Concluída')}
            >
                {task.status === 'Não Concluída' ?
                <RadioButtonUncheckedIcon sx={{ transform: "scale(1.2)" }} /> :
                <TaskAltIcon sx={{ transform: "scale(1.2)" }} />
            }
            </IconButton>

            {(isSmall || isMobile) ?
                null :
                <ListItemIcon>
                    <AssignmentSharpIcon
                        sx={{
                            transform: "scale(1.6)",
                            ml: 2
                        }} />
                </ListItemIcon>
            }

            <Card
                sx={{
                    width: '100%',
                    boxShadow: 0
                }}>
                <CardActionArea
                    onClick={onTaskClick}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: 'center',
                        paddingRight: 1,
                        paddingLeft: 1
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: 'center',
                            width: '100%',
                            rowGap: 0.5
                        }}>
                        <Typography
                            variant="h3"
                            sx={{
                                width: '100%',
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {task.name}
                        </Typography>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                width: '100%',
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: 'nowrap',
                                mb: '5px'
                            }}
                        >
                            {task.description}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                columnGap: 3,
                                rowGap: 1
                            }}>

                            <Typography
                                variant="body1">
                                {"Data: " + task.date.toLocaleDateString()}
                            </Typography>

                            <Typography
                                variant="body1">
                                {"Tipo: " + (task.type === 'public' ? 'Pública' : 'Pessoal')}
                            </Typography>

                            <Typography
                                variant="body1">
                                {"Criador: " + task.userName}
                            </Typography>

                        </Box>
                    </Box>
                </CardActionArea>
            </Card>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: (isSmall || isMobile) ? 'column' : 'row'
                }}
            >
                <IconButton
                    size="large"
                    onClick={() => onEditClick(task)}>
                    <EditSharpIcon />
                </IconButton>
                <IconButton
                    size="large"
                    onClick={() => onDeleteClick(task)}>
                    <DeleteSharpIcon />
                </IconButton>
            </Box>
        </ListItem>
    );
};