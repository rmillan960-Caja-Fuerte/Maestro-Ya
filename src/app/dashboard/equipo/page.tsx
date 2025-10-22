"use client";
import { useState, useEffect, useMemo } from "react";
import { db, storage } from "@/firebase"; // <-- CORREGIDO
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, Edit, FileDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Tipos
interface Master {
    id: string;
    name: string;
    phone: string;
    specialty: string;
    criminalRecordUrl?: string;
    createdAt: Timestamp;
}

const initialFormState = { name: "", phone: "", specialty: "" };

export default function TeamPage() {
    const [masters, setMasters] = useState<Master[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMaster, setEditingMaster] = useState<Master | null>(null);
    const [formState, setFormState] = useState(initialFormState);
    const [recordFile, setRecordFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // Cargar datos
    const fetchMasters = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "masters"));
            const mastersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Master));
            setMasters(mastersData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
        } catch (error) {
            console.error("Error fetching masters:", error);
            toast({ title: "Error al cargar maestros", description: "No se pudieron obtener los datos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMasters();
    }, []);

    // Manejo del formulario
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRecordFile(e.target.files[0]);
        }
    };
    
    // Acciones CRUD
    const handleSaveMaster = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name || !formState.phone || !formState.specialty) {
            toast({ title: "Campos requeridos", description: "Por favor, complete todos los campos.", variant: "destructive" });
            return;
        }

        try {
            let fileUrl = editingMaster?.criminalRecordUrl || "";

            // Subir nuevo archivo si se seleccionó uno
            if (recordFile) {
                // Borrar archivo antiguo si existe (solo en modo edición)
                if (editingMaster?.criminalRecordUrl) {
                    try { 
                        const oldFileRef = ref(storage, editingMaster.criminalRecordUrl);
                        await deleteObject(oldFileRef); 
                    } catch (err) { 
                        console.warn("Old file not found or permission error, skipping deletion.", err); 
                    }
                }
                const filePath = `criminal-records/${Date.now()}_${recordFile.name}`;
                const fileRef = ref(storage, filePath);
                const uploadResult = await uploadBytes(fileRef, recordFile);
                fileUrl = await getDownloadURL(uploadResult.ref);
            }

            const dataToSave: any = {
                ...formState,
                criminalRecordUrl: fileUrl || null // Importante: usar null en lugar de undefined
            };
            
            // Limpiar cualquier campo undefined residual
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });


            if (editingMaster?.id) {
                await updateDoc(doc(db, 'masters', editingMaster.id), dataToSave);
                toast({ title: "Maestro actualizado con éxito" });
            } else {
                await addDoc(collection(db, 'masters'), { ...dataToSave, createdAt: serverTimestamp() });
                toast({ title: "Maestro agregado con éxito" });
            }

            fetchMasters();
            closeDialog();

        } catch (error) {
            console.error("Error saving master: ", error);
            toast({ title: "Error al guardar", description: "Hubo un problema al guardar los datos.", variant: "destructive" });
        }
    };

    const handleDeleteMaster = async (masterId: string, fileUrl?: string) => {
        try {
            // Borrar archivo de antecedentes si existe
            if (fileUrl) {
                try {
                    const fileRef = ref(storage, fileUrl);
                    await deleteObject(fileRef);
                } catch (err) {
                    console.warn("File to delete not found or permission error.", err);
                }
            }
            // Borrar documento de la base de datos
            await deleteDoc(doc(db, "masters", masterId));
            toast({ title: "Maestro eliminado con éxito" });
            fetchMasters();
        } catch (error) {
            console.error("Error deleting master:", error);
            toast({ title: "Error al eliminar", description: "Hubo un problema al eliminar el maestro.", variant: "destructive" });
        }
    };

    // Control del diálogo
    const openDialogForNew = () => {
        setEditingMaster(null);
        setFormState(initialFormState);
        setRecordFile(null);
        setIsDialogOpen(true);
    };

    const openDialogForEdit = (master: Master) => {
        setEditingMaster(master);
        setFormState({ name: master.name, phone: master.phone, specialty: master.specialty });
        setRecordFile(null);
        setIsDialogOpen(true);
    };
    
    const closeDialog = () => {
        setIsDialogOpen(false);
        // Pequeño retraso para permitir que la animación de cierre termine
        setTimeout(() => {
            setEditingMaster(null);
            setFormState(initialFormState);
            setRecordFile(null);
        }, 300);
    }

    // Filtrado
    const filteredMasters = useMemo(() =>
        masters.filter(master =>
            master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            master.specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [masters, searchTerm]
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Gestión de Equipo</h1>
                <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4" /> Agregar Maestro</Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Buscar por nombre o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Especialidad</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Antecedentes</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                        ) : filteredMasters.length > 0 ? (
                            filteredMasters.map(master => (
                                <TableRow key={master.id}>
                                    <TableCell>{master.name}</TableCell>
                                    <TableCell>{master.specialty}</TableCell>
                                    <TableCell>{master.phone}</TableCell>
                                    <TableCell>
                                        {master.criminalRecordUrl ? (
                                            <a href={master.criminalRecordUrl} target="_blank" rel="noopener noreferrer">
                                                <FileDown className="h-5 w-5 text-blue-500" />
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openDialogForEdit(master)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 hover:text-red-700">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará permanentemente al maestro y sus datos asociados.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteMaster(master.id, master.criminalRecordUrl)}>Continuar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center">No se encontraron maestros.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
                     <form onSubmit={handleSaveMaster}>
                        <DialogHeader>
                            <DialogTitle>{editingMaster ? "Editar Maestro" : "Agregar Maestro"}</DialogTitle>
                            <DialogDescription>
                                Complete los detalles del maestro. Haga clic en guardar cuando haya terminado.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input name="name" placeholder="Nombre" value={formState.name} onChange={handleFormChange} required />
                            <Input name="specialty" placeholder="Especialidad" value={formState.specialty} onChange={handleFormChange} required />
                            <Input name="phone" placeholder="Teléfono" value={formState.phone} onChange={handleFormChange} required />
                            <div>
                                <label className="text-sm font-medium">Antecedentes Penales (PDF)</label>
                                <Input type="file" name="criminalRecord" accept=".pdf" onChange={handleFileChange} />
                                {recordFile && <p className="text-sm text-muted-foreground mt-1">{recordFile.name}</p>}
                                {!recordFile && editingMaster?.criminalRecordUrl && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Archivo actual: <a href={editingMaster.criminalRecordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">ver archivo</a>
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                               <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}