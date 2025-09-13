import numpy as np

def normalize_and_center_joints(joints, center):
    # Subtract center and apply a 180-degree flip around the X-axis (Y and Z flip)
    normalized = (joints - center) * np.array([1, -1, -1])
    return normalized

def vertical_center_joints(joints):
    y_vals = joints[:, 1]
    offset = (np.max(y_vals) + np.min(y_vals)) / 2
    joints[:, 1] -= offset
    return joints

def analyze_body_proportions(npz_path):
    data = np.load(npz_path)
    joints = data['joints_3d']  # Shape: (44, 3)
    cam_t = data['cam_t'] if 'cam_t' in data else None

    try:
        # Calculate mesh center based on bounding box center
        center = np.mean(joints, axis=0)

        # ✅ Normalize and vertically center joints
        joints_normalized = normalize_and_center_joints(joints, center)
        joints_centered = vertical_center_joints(joints_normalized.copy())

        # Use joint indices
        left_shoulder = joints_centered[17]
        right_shoulder = joints_centered[18]
        left_hip = joints_centered[2]
        right_hip = joints_centered[5]
        neck = joints_centered[11]
        left_knee = joints_centered[6]
        right_knee = joints_centered[3]

        shoulder_width = np.linalg.norm(left_shoulder - right_shoulder)
        waist_width = np.linalg.norm(left_hip - right_hip)
        mid_hip = (left_hip + right_hip) / 2
        torso_length = np.linalg.norm(neck - mid_hip)

        left_leg = np.linalg.norm(left_hip - left_knee)
        right_leg = np.linalg.norm(right_hip - right_knee)
        leg_length = (left_leg + right_leg) / 2

        proportions = {
            "allJoints": joints_centered.tolist(),  # Already normalized + centered
            "center": center.tolist(),  # Optional: return mesh center used for normalization
        }

        if cam_t is not None:
            proportions["cam_t"] = (cam_t - center).tolist()  # Align cam_t to same center

        return proportions

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    path = "./generated/0_0_joints.npz"
    result = analyze_body_proportions(path)
    if result:
        print("\n📊 Body Proportions:")
        for k, v in result.items():
            if isinstance(v, float):
                print(f"{k}: {v:.4f}")
            else:
                print(f"{k}: {v}")
