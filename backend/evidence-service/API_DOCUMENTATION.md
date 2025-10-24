# Evidence Service API Documentation

## Overview
This service provides reactive REST APIs for managing orders, jobs, and proof of delivery (POD) data using MongoDB. The service follows the same structure as the auth-users-service and uses reactive programming with WebFlux.

## Base URL
```
http://localhost:8082/api/v1
```

## Database
- **MongoDB Atlas**: `foodrescue_evidence` database
- **Collections**: `orders`, `jobs`, `pods`
- **Reactive**: Uses Spring Data MongoDB Reactive

## API Endpoints

### Orders API (`/api/v1/orders`)

#### 1. Create Order
- **POST** `/api/v1/orders`
- **Request Body:**
```json
{
  "receiverId": "user123",
  "deliveryAddressId": "addr456",
  "status": "pending",
  "notes": "Handle with care",
  "recipientName": "John Smith",
  "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "receiverId": "user123",
    "deliveryAddressId": "addr456",
    "orderDate": "2024-01-15",
    "status": "pending",
    "notes": "Handle with care",
    "recipientName": "John Smith",
    "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": null
}
```

#### 2. Get Order by ID
- **GET** `/api/v1/orders/{orderId}`

#### 3. Get Order by Receiver ID and Status
- **GET** `/api/v1/orders/receiver/{receiverId}/status/{status}`

#### 4. Get Orders by Receiver ID
- **GET** `/api/v1/orders/receiver/{receiverId}`

#### 5. Get Orders by Status
- **GET** `/api/v1/orders/status/{status}`

#### 6. Update Order Status
- **PUT** `/api/v1/orders/{orderId}/status?status=delivered`

#### 7. Delete Order
- **DELETE** `/api/v1/orders/{orderId}`

### Jobs API (`/api/v1/jobs`)

#### 1. Create Job
- **POST** `/api/v1/jobs`
- **Request Body:**
```json
{
  "courierId": "courier789",
  "orderId": "507f1f77bcf86cd799439011",
  "status": "assigned",
  "notes": "Handle with care",
  "recipientName": "John Smith",
  "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001"
}
```

#### 2. Get Job by ID
- **GET** `/api/v1/jobs/{jobId}`

#### 3. Get Jobs by Order ID and Status
- **GET** `/api/v1/jobs/order/{orderId}/status/{status}`

#### 4. Get Jobs by Courier ID
- **GET** `/api/v1/jobs/courier/{courierId}`

#### 5. Get Jobs by Order ID
- **GET** `/api/v1/jobs/order/{orderId}`

#### 6. Get Jobs by Status
- **GET** `/api/v1/jobs/status/{status}`

#### 7. Get Jobs by Courier ID and Status
- **GET** `/api/v1/jobs/courier/{courierId}/status/{status}`

#### 8. Update Job Status
- **PUT** `/api/v1/jobs/{jobId}/status?status=completed`

#### 9. Delete Job
- **DELETE** `/api/v1/jobs/{jobId}`

### POD API (`/api/v1/pods`)

#### 1. Create POD
- **POST** `/api/v1/pods`
- **Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439012",
  "otp": "123456",
  "qrCode": "QR_ABC123",
  "verificationMethod": "OTP"
}
```

#### 2. Get POD by ID
- **GET** `/api/v1/pods/{podId}`

#### 3. Get PODs by Job ID
- **GET** `/api/v1/pods/job/{jobId}`

#### 4. Verify Delivery (OTP or QR Code)
- **POST** `/api/v1/pods/verify`
- **Request Body:**
```json
{
  "jobId": "507f1f77bcf86cd799439012",
  "verificationCode": "123456",
  "verificationMethod": "OTP"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Verification successful",
    "receiverId": "user123",
    "recipientName": "John Smith",
    "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001"
  },
  "message": null
}
```

#### 5. Get PODs by Verification Method
- **GET** `/api/v1/pods/verification-method/{verificationMethod}`

#### 6. Get PODs by Verified Status
- **GET** `/api/v1/pods/verified/{isVerified}`

#### 7. Delete POD
- **DELETE** `/api/v1/pods/{podId}`

## Testing the APIs

### Using curl:

1. **Create an Order:**
```bash
curl -X POST http://localhost:8082/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"receiverId": "user123", "deliveryAddressId": "addr456", "status": "pending", "trackingNumber": "TRK-2024-001234", "recipientName": "John Smith", "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001"}'
```

2. **Create a Job:**
```bash
curl -X POST http://localhost:8082/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{"courierId": "courier789", "orderId": "ORDER_ID_FROM_ABOVE", "status": "assigned", "trackingNumber": "JOB-2024-001234", "recipientName": "John Smith", "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001"}'
```

3. **Create a POD:**
```bash
curl -X POST http://localhost:8082/api/v1/pods \
  -H "Content-Type: application/json" \
  -d '{"jobId": "JOB_ID_FROM_ABOVE", "otp": "123456", "qrCode": "QR_ABC123", "verificationMethod": "OTP"}'
```

4. **Verify OTP:**
```bash
curl -X POST http://localhost:8082/api/v1/pods/verify \
  -H "Content-Type: application/json" \
  -d '{"jobId": "JOB_ID_FROM_ABOVE", "verificationCode": "123456", "verificationMethod": "OTP"}'
```

5. **Verify QR Code:**
```bash
curl -X POST http://localhost:8082/api/v1/pods/verify \
  -H "Content-Type: application/json" \
  -d '{"jobId": "JOB_ID_FROM_ABOVE", "verificationCode": "QR_ABC123", "verificationMethod": "QR_CODE"}'
```

## Setup Instructions

1. **Database Setup:**
   - MongoDB Atlas database: `foodrescue_evidence` (already configured)
   - Collections will be created automatically: `orders`, `jobs`, `pods`

2. **Run the Application:**
   ```bash
   cd backend/evidence-service
   mvn spring-boot:run
   ```

3. **Frontend Integration:**
   - The frontend `CourierVerificationPage.jsx` is configured to interact with this backend.
   - Test data is created automatically when the frontend page loads.

## Database Schema

### Orders Collection
- `id`: String (Primary Key)
- `receiverId`: String (Required)
- `deliveryAddressId`: String (Required)
- `orderDate`: LocalDate (Required)
- `status`: String (Required)
- `notes`: String (Optional)
- `recipientName`: String (Optional)
- `deliveryAddress`: String (Optional)
- `createdAt`: Instant (Auto-generated)
- `updatedAt`: Instant (Auto-generated)

### Jobs Collection
- `id`: String (Primary Key)
- `courierId`: String (Required)
- `orderId`: String (Required, Foreign Key to Orders)
- `status`: String (Required)
- `assignedAt`: LocalDate (Required)
- `completedAt`: LocalDate (Optional)
- `notes`: String (Optional)
- `recipientName`: String (Optional)
- `deliveryAddress`: String (Optional)
- `createdAt`: Instant (Auto-generated)
- `updatedAt`: Instant (Auto-generated)

### PODs Collection
- `id`: String (Primary Key)
- `jobId`: String (Required, Foreign Key to Jobs)
- `otp`: String (Required)
- `qrCode`: String (Optional)
- `verificationMethod`: String (Optional, Default: "OTP")
- `verifiedAt`: Instant (Optional)
- `isVerified`: Boolean (Default: false)
- `verificationAttempts`: Integer (Default: 0)
- `createdAt`: Instant (Auto-generated)
- `updatedAt`: Instant (Auto-generated)

## Relationships

1. **One-to-Many**: Order → Jobs
   - One order can have multiple jobs
   - Jobs reference orders via `orderId`

2. **One-to-Many**: Job → PODs
   - One job can have multiple POD records
   - PODs reference jobs via `jobId`

## Error Handling

The service includes comprehensive error handling:
- Global exception handler for consistent error responses
- Validation errors for invalid input
- Not found errors for missing resources
- Duplicate key errors for unique constraints
