import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Pipe = {
    id?: string;
    bandwidth: string;
    metric: string;
    mask: string;
    description: string;
    displayMetric?: string;
    displayMask?: string;
};

const PipesTab: React.FC = () => {
    const [pipes, setPipes] = useState<Pipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Pipe | null>(null);
    const [form, setForm] = useState<Pipe>({
        bandwidth: "",
        metric: "",
        mask: "",
        description: "",
    });

    // Fetch all pipes
    const fetchPipes = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/pipes");
            const rows = Array.isArray(res.data.data?.rows) ? res.data.data.rows : [];
            setPipes(
                rows.map((r: any) => ({
                    id: r.uuid,
                    bandwidth: r.bandwidth,
                    metric: r.bandwidthMetric,
                    mask: r.mask,
                    description: r.description,
                    displayMetric: r["%bandwidthMetric"],
                    displayMask: r["%mask"],
                }))
            );
        } catch (err) {
            console.error(err);
            setPipes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipes();
    }, []);

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditing(null);
        setForm({ bandwidth: "", metric: "", mask: "", description: "" });
        setOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (pipe: Pipe) => {
        setEditing(pipe);
        setForm({ ...pipe });
        setOpen(true);
    };

    // Save (create/update)
    const handleSave = async () => {
        try {
            if (editing && editing.id) {
                await axios.put(`http://localhost:4000/bandwidth/pipes/${editing.id}`, form);
                alert("Pipe updated successfully!");
            } else {
                await axios.post("http://localhost:4000/bandwidth/pipes", form);
                alert("Pipe created successfully!");
            }
            setOpen(false);
            fetchPipes();
        } catch (err) {
            console.error(err);
            alert("Failed to save pipe.");
        }
    };

    // Delete
    const handleDelete = async (id?: string) => {
        if (!id || !confirm("Are you sure you want to delete this pipe?")) return;
        try {
            await axios.delete(`http://localhost:4000/bandwidth/pipes/${id}`);
            alert("Pipe deleted successfully!");
            fetchPipes();
        } catch (err) {
            console.error(err);
            alert("Failed to delete pipe.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                <Button onClick={handleOpenAdd}>Add Pipe</Button>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="w-full border">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border p-2">Bandwidth</th>
                                <th className="border p-2">Mask</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {pipes.map((p) => (
                                <tr key={p.id}>
                                    <td className="border p-2">
                                        {p.bandwidth} {p.displayMetric || p.metric}
                                    </td>
                                    <td className="border p-2">{p.displayMask || p.mask}</td>
                                    <td className="border p-2">{p.description || "None"}</td>
                                    <td className="border p-2 flex gap-2 justify-center">
                                        <Button onClick={() => handleOpenEdit(p)}>Edit</Button>
                                        <Button
                                            onClick={() => handleDelete(p.id)}
                                            className="bg-red-600 text-white"
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Dialog for Add/Edit */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-4 max-w-md">
                    <DialogTitle>{editing ? "Edit Pipe" : "Add Pipe"}</DialogTitle>
                    <div className="grid grid-cols-1 gap-3 mt-4">
                        <div className="flex flex-row gap-2">
                            <label className="w-full">
                                Bandwidth
                                <Input
                                    type="number"
                                    value={form.bandwidth}
                                    onChange={(e) => setForm({ ...form, bandwidth: e.target.value })}
                                />
                            </label>
                            <label>
                                Metric
                                <Select
                                    value={form.metric}
                                    onValueChange={(val) =>
                                        setForm({ ...form, metric: val as "bit" | "Kbit" | "Mbit" | "Gbit" })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Metric" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bit">bps</SelectItem>
                                        <SelectItem value="Kbit">kbps</SelectItem>
                                        <SelectItem value="Mbit">mbps</SelectItem>
                                        <SelectItem value="Gbit">gbps</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                            <label>
                                Mask
                                <Select
                                    value={form.mask}
                                    onValueChange={(val) =>
                                        setForm({
                                            ...form,
                                            mask: val as "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6",
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Mask" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="src-ip">Source</SelectItem>
                                        <SelectItem value="dst-ip">Destination</SelectItem>
                                        <SelectItem value="src-ip6">Source (IPv6)</SelectItem>
                                        <SelectItem value="dst-ip6">Destination (IPv6)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                        </div>

                        <label>
                            Description
                            <Input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </label>

                        <div className="flex gap-2 justify-end mt-2">
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? "Update" : "Add"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PipesTab;
