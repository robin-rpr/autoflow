# Workflow Editor

This document describes the three core node types supported by the Visual Workflow Editor.

## 1. http_request Node 🌐

**Purpose**: Makes HTTP requests to external APIs or services.

### Configuration Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `method` | Select | HTTP method (GET, POST, PUT, DELETE, PATCH) | `GET` |
| `url` | String | Target endpoint URL | `https://api.example.com/orders` |
| `headers` | JSON | Custom HTTP headers | `{"Authorization": "Bearer token123"}` |

### Example Configuration

```json
{
  "label": "Fetch Customer Orders",
  "method": "GET",
  "url": "https://api.shop.com/v1/orders",
  "headers": "{\"Authorization\": \"Bearer token\", \"Content-Type\": \"application/json\"}"
}
```

### Output

Returns the API response data that can be consumed by downstream nodes.

---

## 2. transform Node ⚙️

**Purpose**: Reshapes or computes new data with support for upstream node references and conditional logic.

### Configuration Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | String | Human-readable description | `Apply discount based on customer tier` |
| `upstreamRefs` | String | Comma-separated upstream node IDs | `$node1, $node2` |
| `expression` | JavaScript | Transformation logic with conditionals | See below |

### Key Features

#### 1. Reference Upstream Node Data
Access data from connected upstream nodes using the `$nodeId.data` syntax:

```javascript
const orderData = $orderNode.data;
const customerData = $customerNode.data;
```

#### 2. Conditional Expressions
Return different values based on conditions:

```javascript
// Simple conditional
const discount = customer.tier === 'premium' ? 0.2 : 0.1;

// Complex conditional with multiple checks
const finalPrice = order.status === 'active' && customer.tier === 'premium'
  ? order.total * 0.8
  : order.total;
```

#### 3. Data Transformation
Reshape, filter, or compute derived values:

```javascript
return data.map(item => ({
  ...item,
  discountPrice: item.price * 0.9,
  eligible: item.total > 100
}));
```

### Complete Example

```javascript
{
  "label": "Calculate Discounted Total",
  "description": "Apply tiered discounts based on customer status and order total",
  "upstreamRefs": "$orderData, $customerProfile",
  "expression": `
    const order = $orderData.data;
    const customer = $customerProfile.data;
    
    // Conditional discount calculation
    let discount = 0;
    if (customer.tier === 'premium' && order.total > 1000) {
      discount = 0.25;
    } else if (customer.tier === 'premium') {
      discount = 0.15;
    } else if (order.total > 500) {
      discount = 0.10;
    }
    
    return {
      orderId: order.id,
      originalTotal: order.total,
      discount: discount,
      finalTotal: order.total * (1 - discount),
      customerTier: customer.tier
    };
  `
}
```

---

## 3. filter Node 🔍

**Purpose**: Filters arrays based on conditions OR removes fields from objects.

### Configuration Fields

| Field | Type | Description | Modes |
|-------|------|-------------|-------|
| `filterType` | Select | Type of filtering operation | `array` or `object` |
| `condition` | String | JavaScript condition for array filtering | Array mode only |
| `fields` | String | Comma-separated field names to keep | Object mode only |

### Mode 1: Array Filtering

Filters array items that match a given condition.

#### Configuration Example

```json
{
  "label": "Active High-Value Orders",
  "filterType": "array",
  "condition": "item.status === 'active' && item.total > 100"
}
```

#### Condition Examples

```javascript
// Filter by single field
"item.status === 'active'"

// Filter by multiple conditions
"item.status === 'active' && item.total > 100"

// Filter with string comparison
"item.category === 'electronics' && item.inStock === true"

// Filter with date comparison
"new Date(item.orderDate) > new Date('2024-01-01')"
```

#### Input/Output Example

**Input**:
```json
[
  {"id": 1, "status": "active", "total": 150},
  {"id": 2, "status": "inactive", "total": 200},
  {"id": 3, "status": "active", "total": 50},
  {"id": 4, "status": "active", "total": 300}
]
```

**Output** (with condition `item.status === 'active' && item.total > 100`):
```json
[
  {"id": 1, "status": "active", "total": 150},
  {"id": 4, "status": "active", "total": 300}
]
```

### Mode 2: Object Filtering

Removes all fields except the specified ones.

#### Configuration Example

```json
{
  "label": "Customer Summary",
  "filterType": "object",
  "fields": "id, name, email, tier"
}
```

#### Input/Output Example

**Input**:
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "tier": "premium",
  "internalNotes": "VIP customer",
  "createdAt": "2024-01-01"
}
```

**Output** (with fields `id, name, email, tier`):
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "tier": "premium"
}
```

---

## Workflow Examples

### Example 1: E-commerce Order Processing

```
[http_request: Fetch Orders]
    ↓
[filter: Active Orders Only] (array mode: item.status === 'active')
    ↓
[transform: Calculate Discounts] (reference order data, apply conditional logic)
    ↓
[filter: Customer Data Summary] (object mode: keep id, name, email, total)
```

### Example 2: Customer Eligibility Check

```
[http_request: Get Customer Data]
    ↓
[http_request: Get Order History]
    ↓
[transform: Check Eligibility] (reference both nodes, conditional: return eligible if total > 1000)
    ↓
[filter: Eligible Customers] (array mode: item.eligible === true)
```

---

## Implementation Notes

### Node Connections

- **http_request**: Has output handle only (source node)
- **transform**: Has both input and output handles (middle node)
- **filter**: Has both input and output handles (middle node)

### Data Flow

1. Data flows from top to bottom through the DAG
2. Each node processes input from upstream nodes
3. Processed data is passed to downstream nodes
4. The workflow maintains the DAG structure (no cycles)

### Validation

Future enhancements should include:
- DAG cycle detection
- Type checking for node outputs/inputs
- Validation of JavaScript expressions
- Runtime error handling

---

## UI Features

### Configuration Panel

Each node type has a dedicated configuration panel with:
- Context-sensitive fields based on node type
- Help text and placeholders for guidance
- Real-time updates to node display
- Input validation

### Visual Feedback

- Color-coded node borders by type
- Display of key configuration on node cards
- Selection highlighting
- Connection handles for data flow

### Node Palette

Drag-and-drop interface for adding nodes:
- 🌐 HTTP Request (blue)
- ⚙️ Transform (purple)
- 🔍 Filter (green)
