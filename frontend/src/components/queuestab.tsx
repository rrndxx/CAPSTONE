import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Queue = {
    id?: string;
    pipe: string;
    weight: string;
    mask: string;
    description: string;
    displayPipe?: string;
    displayMask?: string;
};

export type Pipe = {
    id: string;
    bandwidth: string;
    metric: string;
    displaymetric: string;
    delay: string;
    description: string;
};

const QueuesTab: React.FC = () => {
    const [queues, setQueues] = useState<Queue[]>([]);
    const [pipes, setPipes] = useState<Pipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Queue | null>(null);
    const [form, setForm] = useState<Queue>({
        pipe: "",
        weight: "",
        mask: "",
        description: "",
    });

    const formatWeight = (weight: string | number) => {
        const w = Number(weight);
        if (w >= 0 && w <= 19) return `${w} (Low)`;
        if (w >= 20 && w <= 39) return `${w} (Medium)`;
        if (w >= 40 && w <= 59) return `${w} (High)`;
        if (w >= 60 && w <= 79) return `${w} (Higher)`;
        if (w >= 80) return `${w} (Priority)`;
        return weight;
    };

    const fetchQueues = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/queues");
            const rows = Array.isArray(res.data.data?.rows) ? res.data.data.rows : [];
            setQueues(
                rows.map((r: any) => ({
                    id: r.uuid,
                    pipe: r.pipe,
                    weight: r.weight,
                    mask: r.mask,
                    description: r.description,
                    displayPipe: r["%pipe"],
                    displayMask: r["%mask"],
                }))
            );
        } catch (err) {
            console.error(err);
            setQueues([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPipes = async () => {
        try {
            const res = await axios.get("http://localhost:4000/bandwidth/pipes");
            const rows = Array.isArray(res.data.data?.rows) ? res.data.data.rows : [];
            setPipes(
                rows.map((p: any) => ({
                    id: p.uuid,
                    bandwidth: p.bandwidth,
                    metric: p.bandwidthMetric,
                    displaymetric: p["%bandwidthMetric"],
                    description: p.description || `Pipe ${p.uuid}`,
                }))
            );
        } catch (err) {
            console.error("Failed to fetch pipes:", err);
            setPipes([]);
        }
    };

    useEffect(() => {
        fetchQueues();
        fetchPipes();
    }, []);

    const handleOpenAdd = () => {
        setEditing(null);
        setForm({ pipe: "", weight: "", mask: "", description: "" });
        setOpen(true);
    };

    const handleOpenEdit = (queue: Queue) => {
        setEditing(queue);
        setForm({ ...queue });
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editing && editing.id) {
                await axios.put(`http://localhost:4000/bandwidth/queues/${editing.id}`, form);
                alert("Queue updated successfully!");
            } else {
                await axios.post("http://localhost:4000/bandwidth/queues", form);
                alert("Queue created successfully!");
            }
            setOpen(false);
            fetchQueues();
        } catch (err) {
            console.error(err);
            alert("Failed to save queue.");
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id || !confirm("Are you sure you want to delete this queue?")) return;
        try {
            await axios.delete(`http://localhost:4000/bandwidth/queues/${id}`);
            alert("Queue deleted successfully!");
            fetchQueues();
        } catch (err) {
            console.error(err);
            alert("Failed to delete queue.");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                <Button onClick={handleOpenAdd}>Add Queue</Button>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="w-full border">
                        <thead className="bg-primary text-white">
                            <tr>
                                <th className="border p-2">Pipe</th>
                                <th className="border p-2">Weight</th>
                                <th className="border p-2">Mask</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {queues.map((q) => (
                                <tr key={q.id}>
                                    <td className="border p-2">{q.displayPipe || q.pipe}</td>
                                    <td className="border p-2">{formatWeight(q.weight)}</td>
                                    <td className="border p-2">{q.displayMask || q.mask}</td>
                                    <td className="border p-2">{q.description || "None"}</td>
                                    <td className="border p-2 flex gap-2 justify-center">
                                        <Button onClick={() => handleOpenEdit(q)}>Edit</Button>
                                        <Button onClick={() => handleDelete(q.id)} className="bg-red-600">
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-4 max-w-md">
                    <DialogTitle>{editing ? "Edit Queue" : "Add Queue"}</DialogTitle>
                    <div className="grid grid-cols-1 gap-3 mt-4">
                        <div className="flex flex-row gap-2">
                            <label >
                                Pipe
                                <Select
                                    value={form.pipe}
                                    onValueChange={(val) => setForm({ ...form, pipe: val })}
                                    disabled={editing ? true: false}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Pipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pipes.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.description} ({p.bandwidth} {p.displaymetric})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </label>
                            <label>
                                Weight
                                <Input
                                    type="number"
                                    value={form.weight}
                                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                    placeholder="1-100"
                                />
                            </label>
                            <label>
                                Mask
                                <Select
                                    value={form.mask}
                                    onValueChange={(val) =>
                                        setForm({ ...form, mask: val as "none" | "src-ip" | "dst-ip" | "src-ip6" | "dst-ip6" })
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

export default QueuesTab;
